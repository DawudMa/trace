import {
  loadCss,
  loadModules
} from 'esri-loader';
import Scroll from '@/components/scroll'
import { WGS2GCJ02, g_WGS2GCJ02  } from '@/api/calc.js'

export default {
  name: 'ArcgisMap',
  data() {
    const generateData = () => {
      let x = require('@/json/guiji.json')
      const cskData = [];
      for (let i = 0; i < x.length; i++) {
        let l = x[i].location;
        cskData.push({
          key: i,
          label: l ? l : "未知地址" + i ,
          disabled: false
        })
      }
      return cskData;
    };
    const getGuiji = () => {
      return require('@/json/guiji.json');
    };
    return {
      cskData: generateData(),
      allRecords: getGuiji(),
      selectedRecords: null,
      cskValue: [],
      startPlanning: null,
      gisConstructor: {}, //gis 构造函数
      gisInst: {}, // gis 实例
      gisResource: {
        css: 'https://js.arcgis.com/3.28/esri/css/esri.css',
        dojo: 'https://js.arcgis.com/3.28',
        // server: 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer'
        // server: 'http://server.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer'
        // server: 'http://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'
        // server: 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer' 
        // server: 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetGray/MapServer'
        server: 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer'
      },
      gisModules: [ // 加载模块
        "esri/map",
        "dojo/on",
        "dojo/dom",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/layers/ArcGISTiledMapServiceLayer",
        'esri/layers/WMSLayer',
        'esri/layers/WMSLayerInfo',
        'esri/layers/FeatureLayer',
        'esri/layers/KMLLayer',
        'esri/layers/WFSLayer',
        "esri/layers/TileInfo",
        "esri/tasks/RouteTask",
        "esri/tasks/RouteParameters",
        "esri/layers/WebTiledLayer",
        "esri/graphicsUtils",
        "esri/tasks/FindTask",
        "esri/tasks/FindParameters",
        "esri/tasks/query",
        "esri/tasks/FeatureSet",
        "esri/dijit/Search",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/TextSymbol",
        "esri/renderers/Renderer",
        "esri/toolbars/draw",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/renderers/SimpleRenderer",
        "esri/renderers/HeatmapRenderer",
        "esri/tasks/RouteParameters",
        "esri/geometry/webMercatorUtils",
        "dojo/colors",
        "dojo/parser",
        "esri/graphic",
        "esri/dijit/Popup",
        "dijit/TooltipDialog",
        "esri/InfoTemplate",
        "esri/dijit/InfoWindow",
        "dojo/dom-construct",
        "dojo/number",
        "dojo/parser",
        "esri/SpatialReference",
        "dojo/domReady!map"
      ]
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    // 加载地图
    init() {
      // 加载css;
      loadCss(this.gisResource.css);
      // 加载模块
      loadModules(this.gisModules, {
        url: this.gisResource.dojo,
      })
        .then(this.initMap);
    },
    // 初始化地图
    initMap(args) {
      esriConfig.defaults.io.proxyUrl = "http://119.29.205.254:6080/proxy/proxy.jsp";
      esriConfig.defaults.io.alwaysUseProxy = false;
      for (let k in args) {
        let name = this.gisModules[k].split('/').pop();
        this.gisConstructor[name] = args[k];
      }
      this.gisConstructor.parser.parse()
      // 创建地图实例
      let map = new this.gisConstructor.map("map", {
        center: [87.60095799960,43.78607099960],
        zoom: 14,
        logo: false,
        maxZoom: 19,
        minZoom: 6,
        isKeyboardNavigation: false,
        slider: false,
        smartNavigation: false,
        showAttribution: false
      });
      // 绑定到组件，方便操作
      this.gisInst.map = map;
      let layer = new this.gisConstructor.ArcGISTiledMapServiceLayer(this.gisResource.server, {
        useMapImage: false
      });
      let spatialReference = new this.gisConstructor.SpatialReference({
        wkid: 4326
      })
      //实例化地图标注
      let anooMarkerLayer = new this.gisConstructor.WebTiledLayer('http://${subDomain}.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX=${level}&TILEROW=${row}&TILECOL=${col}&tk=7bfee1de0d76ee6998f0328a4b763c37.png', {
        id: "anooMarkerMap",
        subDomains: ['t0'],
        // tileInfo: tileInfo,
        spatialReference: spatialReference
      });
      map.addLayer(layer)
      //map.addLayer(anooMarkerLayer)

      var allFuser = [];
      var Typhoon = {};
      Typhoon.current = {};
      var firstTime = true;
      var shortestAnalyst;
      var routeParas;
      var CheckStationGraphic, CheckStationRankBGGraphic, CheckStationRankGraphic;
      var solveStatus = {
        solveNum: 0,
        currentNum: 0
      };
      var wangbo = [];
      var CheckStationTMP = [];
      var firstPt = null;
      var guiji;
      var thisX = this;
      map.on('load', () => {
        // 轨迹图层
        var guijiLineBG = esri.layers.GraphicsLayer({ id: "guijiLineBG" });
        map.addLayer(guijiLineBG);
        var guijiLine = esri.layers.GraphicsLayer({ id: "guijiLine" });
        map.addLayer(guijiLine);
        guijiLine.on("MouseOver", function (evt) {
          var lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([255, 0, 0, 0.7]), 8);
          evt.graphic.setSymbol(lineSymbol);
          var s = CheckStationGraphic.graphics[evt.graphic.attributes.index].attributes.location ? CheckStationGraphic.graphics[evt.graphic.attributes.index].attributes.location : "地点" + evt.graphic.attributes.index;
          var e = CheckStationGraphic.graphics[evt.graphic.attributes.index + 1].attributes.location ? CheckStationGraphic.graphics[evt.graphic.attributes.index + 1].attributes.location : "地点" + (evt.graphic.attributes.index + 1);
          var ts = new Date(CheckStationGraphic.graphics[evt.graphic.attributes.index].attributes.pass_time).getTime();
          var te = new Date(CheckStationGraphic.graphics[evt.graphic.attributes.index + 1].attributes.pass_time).getTime();
          var c = te - ts;
          c = parseInt(c / 1000 / 3600);
          var top = map.toScreen(evt.mapPoint).y - 5;
          var left = map.toScreen(evt.mapPoint).x + 30;
          var len = parseInt(parseInt(evt.graphic.attributes["Total_长度"]) / 10) / 100;
          var content = "<scpan>" + "&nbsp&nbsp" + "起始点： " + s + " - " + e + "&nbsp&nbsp" + "</br>"
            + "&nbsp&nbsp" + "路线长度： " + len + " 公里" + "&nbsp&nbsp" + "</br>"
            + "&nbsp&nbsp" + "时间差： " + parseInt(Math.random()*10) + " 小时" + "&nbsp&nbsp" + "</br>" + "</scpan>"
          var tips = document.createElement('div');
          tips.style.position = "absolute";
          tips.style.top = top + "px";
          tips.style.left = left + "px";
          tips.style.z = "1000";
          tips.className = "GraphicTips_guiji";
          tips.innerHTML = content;
          document.body.appendChild(tips);
        });
        guijiLine.on("MouseOut", function (evt) {//鼠标移出移出提示文字
          var lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([0, 105, 255, 0.7]), 8);
          evt.graphic.setSymbol(lineSymbol);
          $('.GraphicTips_guiji').remove();
        });
        CheckStationGraphic = esri.layers.GraphicsLayer({ id: "CheckStationGraphic" });
        map.addLayer(CheckStationGraphic);

        CheckStationGraphic.on("MouseOver", function (evt) {
          showTips(evt.graphic)
        });
        CheckStationGraphic.on("MouseOut", function (evt) {//鼠标移出移出提示文字
          $('.GraphicTips').remove();
        });

        //增加轨迹车
        guiji = esri.layers.GraphicsLayer({ id: "guiji" });
        map.addLayer(guiji);

        //路经规划
        shortestAnalyst = new esri.tasks.RouteTask("http://119.29.205.254:6080/arcgis/rest/services/wlmq_road_network/NAServer/%E8%B7%AF%E5%BE%84");
        //创建路径参数对象
        routeParas = new esri.tasks.RouteParameters();
        //障碍点，但是此时障碍点为空
        routeParas.barriers = new esri.tasks.FeatureSet();
        //停靠点，但是此时停靠点为空
        routeParas.stops = new esri.tasks.FeatureSet();
        //路径是否有方向
        routeParas.returnDirections = false;
        //是否返回路径，此处必须返回
        routeParas.returnRoutes = true;
        //空间参考
        routeParas.outSpatialReference = new esri.SpatialReference(4326);
        //添加障碍点
        var pt = new esri.geometry.Point([87, 42], new esri.SpatialReference(4326));
        var gr = new esri.Graphic(pt);
        routeParas.barriers.features.push(gr);
        // 展示标注
        var showTips = function (g) {
          var top = map.toScreen(g.geometry).y - 55;
          var left = map.toScreen(g.geometry).x + 30;
          var name = g.attributes.location ? g.attributes.location : "未知地址";
          var content = "<span>" + "&nbsp&nbsp" + g.attributes.index + " | " + name + "&nbsp&nbsp" + "</span>"
          var tips = document.createElement('div');
          tips.style.position = "absolute";
          tips.style.top = top + "px";
          tips.style.left = left + "px";
          tips.style.z = "1000";
          tips.className = "GraphicTips";
          tips.innerHTML = content;
          document.body.appendChild(tips);
        }
        // 展示路经
        var showRoute = function (solveResult) {
          guijiLineBG.clear();
          guijiLine.clear();
          var routeResultsX = [];
          for (var i = 0; i < solveResult.length; i++) {
            if (solveResult[i] && solveResult[i].routeResults) {
              routeResultsX.push(solveResult[i].routeResults[0]);
            }
          }
          //路径分析的长度
          var res = routeResultsX.length;
          var lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([0, 105, 255, 0.7]), 8);
          var lineSymbolBG = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([255, 255, 255, 1]), 12);
          var list = [];
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              var graphicroute = routeResultsX[i];
              var graphicBG = new esri.Graphic(g_WGS2GCJ02(graphicroute.route).geometry, null, graphicroute.route.attributes);
              var graphic = new esri.Graphic(g_WGS2GCJ02(graphicroute.route).geometry, null, graphicroute.route.attributes);
              graphic.attributes.index = i;
              graphicBG.setSymbol(lineSymbolBG);
              guijiLineBG.add(graphicBG);
              graphic.setSymbol(lineSymbol);
              guijiLine.add(graphic);
              for (var j = 0; j < graphic.geometry.paths.length; j++) {
                list = list.concat(graphic.geometry.paths[j]);
              }
            }
          }
          // 运动符号
          var guijiSymbol = new esri.symbol.PictureMarkerSymbol(require('@/assets/icon/person.png'), 40, 80);
          Typhoon.current.typhoonIcon = new esri.Graphic($.extend(true, {}, firstPt), guijiSymbol);
          guiji.add(Typhoon.current.typhoonIcon);

          Typhoon.repeat = true;
          Typhoon.current.moveRunning = true;
          Typhoon.current.moveTally = 0;
          Typhoon.current.moveTallyJ = 0;
          $('#guiji_layer image').stop(true, true);
          Typhoon.current.pathList = list;
          if (firstTime) {
            _moveCurrent();
          }
        };
        // 清除所有
        var clearAll = function () {
          CheckStationGraphic.clear();
          solveStatus.solveNum = 0;
          solveStatus.currentNum = 0;
          guijiLine.clear();
          guijiLineBG.clear();
          guiji.clear();
          allFuser = [];
          Typhoon.pathList = [];
          wangbo = [];
          Typhoon.current.pathList = [];
          CheckStationTMP.length = 0;
        };
        // 执行路径规划
        var solvePlanning = function (json, pr, img) {
          CheckStationTMP.length = 0;
          var i = 0;
          var list = [];
          var lujing = new Array();
          lujing[0] = new Array();
          firstPt = null;
          routeParas.stops.features.length = 0;
          for(let j=0;j<json.length;j++) {
            if (i == 0 && json[j].x != "" && json[j].y != "") {
              var xzuo = json[j].x;
              var yzuo = json[j].y;
              var point = new esri.geometry.Point([xzuo, yzuo], new esri.SpatialReference(4326));
              firstPt = point;
              i++;
            }
            var x = Number(json[j].x);
            var y = Number(json[j].y);
            var pt = new esri.geometry.Point([x, y], new esri.SpatialReference(4326));
            pt.attributes = {
              Name: json[j].location ? json[j].location : "未知地址"
            };
            var gs = new esri.Graphic(pt);
            routeParas.stops.features.push(gs);
            list[j] = { x: x, y: y };
            var point = [x, y];
            lujing[0][j] = point;
          }
          if (list.length > 1) {
            shortestAnalyst.solve(routeParas, function (a) {
              solveStatus.currentNum++;
              thisX.$notify({
                title: '轨迹刻画进度：[ ' + solveStatus.currentNum + ' / ' + solveStatus.solveNum + ' ]',
                message: thisX.selectedRecords[solveStatus.currentNum-1].location + " - " + thisX.selectedRecords[solveStatus.currentNum].location,
                type: 'success',
                duration: 1500
              });//s
              wangbo[pr] = a;
              if (solveStatus.currentNum == solveStatus.solveNum) {
                showRoute(wangbo)
              }
            }, function (a) {
              solveStatus.currentNum++;
            });

          } else if (list.length == 1) {
            Typhoon.current.pathList = [];
          }
        };
        // 只有一个点时动画
        var onlyOnePoint = function () {
          var newPoint = Typhoon.current.typhoonIcon.geometry;
          newPoint.setX(firstPt.x);
          newPoint.setY(firstPt.y);
          Typhoon.current.typhoonIcon.setGeometry(newPoint);
        };
        // 从当前开始播放动画
        var _moveCurrent = function () {
          if (!Typhoon.current.moveRunning || Typhoon.current.pathList.length <= 1) {
            firstTime = true;
            onlyOnePoint();
            return;
          }
          firstTime = false;
          var start;
          Typhoon.current.moveTally++;
          // 先将graphic移动至开始点
          $('#guiji_layer').css({
            top: Typhoon.current.pathList[Typhoon.current.moveTally - 1][1],
            left: Typhoon.current.pathList[Typhoon.current.moveTally - 1][0],
          });
          // 如果移动到头了就停止 移动，并清楚graphic
          if (Typhoon.current.moveTally == (Typhoon.current.pathList.length)) {
            guiji.remove(Typhoon.current.typhoonIcon);
            return;
          }
          // 使用jquery的动画，事实的改变graphic的xy坐标
          $('#guiji_layer').animate({
            top: Typhoon.current.pathList[Typhoon.current.moveTally][1],
            left: Typhoon.current.pathList[Typhoon.current.moveTally][0]
          }, {
              duration: 200,
              step: _updateTyphoonIcon,
              complete: function () {
                if (Typhoon.current.moveTally != (Typhoon.current.pathList.length - 1)) {
                  _moveCurrent();
                } else {
                  if (Typhoon.repeat) {
                    Typhoon.current.moveTally = 0;
                    _moveCurrent();
                  } else {
                    guiji.remove(Typhoon.current.typhoonIcon);
                  }
                }
              }
            });
        };
        // 更新小车符号
        var _updateTyphoonIcon = function (now, fx) {
          var newPoint = Typhoon.current.typhoonIcon.geometry;
          if (fx.prop == 'left') {
            newPoint.setX(now);
          } else if (fx.prop == 'top') {
            newPoint.setY(now);
          }
          Typhoon.current.typhoonIcon.setGeometry(newPoint);
        };
        var randomNum = this.randomNum;
        // 规划路经
        var startPlanning = function (json) {
          clearAll();
          for (var i = 0; i < json.length; i++) {//json.length
            
            var pt = new esri.geometry.Point([WGS2GCJ02(json[i].x, json[i].y)[0], WGS2GCJ02(json[i].x, json[i].y)[1]], new esri.SpatialReference(4326));
            allFuser.push(json[i]);
            var attr = json[i];
            attr.index = i + 1;
            var pic = attr.db_name + ".png";
            var pictureMarkerSymbol = new esri.symbol.PictureMarkerSymbol(require("@/assets/icon/" + pic), 30, 61);
            pictureMarkerSymbol.setOffset(0, 30)
            var g = new esri.Graphic(pt, pictureMarkerSymbol, attr);
            CheckStationGraphic.add(g);
          }
          var allPt = new esri.geometry.Polyline();
          allPt.paths.push([]);
          for (var i = 0; i < allFuser.length - 1; i++) {
            var res = [];
            res.push(allFuser[i]);
            res.push(allFuser[i + 1]);
            allPt.paths[0].push([Number(allFuser[i].x), Number(allFuser[i].y)]);
            if (i == allFuser.length - 2) {
              allPt.paths[0].push([Number(allFuser[i + 1].x), Number(allFuser[i + 1].y)]);
            }
            solveStatus.solveNum++;
            solvePlanning(res, i, require('@/assets/icon/person.png'))
          }
          map.setExtent(allPt.getExtent().expand(2))
        };
        thisX.startPlanning = startPlanning;
        // startPlanning(require('@/json/guiji.json'))
      })
    },
    // 穿梭框变化
    handleChange(value, direction, movedKeys) {
      let allRecords = this.allRecords;
      let startPlanning = this.startPlanning;
      let json = [];
      let db = ['jwz','jcz','jgh','wkk','jj', 'xq', 'kk'];
      for(let i=0;i<value.length;i++) {
        allRecords[value[i]].db_name = db[Math.floor((Math.random()*db.length))];
        let x = allRecords[value[i]].x;
        allRecords[value[i]].x = WGS2GCJ02(allRecords[value[i]].x, allRecords[value[i]].y)[0];
        allRecords[value[i]].y = WGS2GCJ02(allRecords[value[i]].x, allRecords[value[i]].y)[1];
        console.log(allRecords[value[i]].x - x)
        json.push(allRecords[value[i]])
      }
      this.selectedRecords = json;
      startPlanning(json)
    },
    // 墨卡托转经纬度
    mercatorTolonlat(mercator) {
      var lonlat = {
        x: 0,
        y: 0
      };
      var x = mercator.x / 20037508.34 * 180;
      var y = mercator.y / 20037508.34 * 180;
      y = 180 / Math.PI * (2 * Math.atan(Math.exp(y * Math.PI / 180)) - Math.PI / 2);
      lonlat.x = x;
      lonlat.y = y;
      return lonlat;
    },
    // 经纬度转墨卡托
    lonlatTomercator(lonlat) {
      var mercator = {
        x: 0,
        y: 0
      };
      var x = lonlat.x * 20037508.34 / 180;
      var y = Math.log(Math.tan((90 + lonlat.y) * Math.PI / 360)) / (Math.PI / 180);
      y = y * 20037508.34 / 180;
      mercator.x = x;
      mercator.y = y;
      return mercator;
    },
    // 生成指定范围内的随机整数
    randomNum(minNum, maxNum) {
      switch (arguments.length) {
        case 1:
          return Number((Math.random() * minNum + 1).toFixed(1))
          break;
        case 2:
          return Number((Math.random() * (maxNum - minNum + 1) + minNum).toFixed(1))
          break;
        default:
          return 0;
          break;
      }
    }
  },
  components: {
    Scroll
  }
};