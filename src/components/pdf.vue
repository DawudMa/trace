<template>
  <div id="pdf">
    <header class="logoHeader" v-show="hShow">
      <a class="toggleSettings" @click="toBack">
        <i class="el-icon-back"></i>
      </a>
      <span class="appTitle">疆天棉图</span>
    </header>
    <div id="pdfDom">
      <div id="pdfSroll_dom">
        <h2>{{ dkData.land_name }}地块棉田长势与健康度监测结果报告</h2>
        <h3>1、监测结果展示</h3>
        <p
          class="info"
        >根据{{ getResultTimes }}，{{ dkData.resultList.length || 0 }}期的卫星遥感影像，对{{ dkData.land_username }}承包的{{ dkData.land_name }}地块进行了棉田长势与健康度的监测，结果如下：</p>
        <div class="result_imgs">
          <div v-for="(item, i) in reverseList" :key="i">
            <img :src="item.imageUrl">
            <p class="f14">{{ item.acquisition_time }}</p>
          </div>
        </div>
        <h3>2、分级面积与比例统计</h3>
        <div class="charts" ref="line"></div>
        <div class="charts_list">
          <div v-for="(item, i) in reverseList" :key="i" :ref="`${item.jobId}_${item.acquisition_time}`"></div>
        </div>
        <h3>3、结果分析与建议</h3>
        <p
          class="info"
        >监测地面面积约为{{ dkData.land_area }}亩，根据监测结果可以看出，自{{ reverseList[0].acquisition_time }}以来，旺苗面积有所增加，主要集中在地块的东部区域，生长状态正常的面积也有所增加，表明整体长势情况良好；同时，弱苗面积也有所增加，主要分布于地块西侧路边处，考虑到棉花所处的生长阶段，初步判断有可能是发生了虫害，尤其是蚜虫，建议加大巡查力度，尤其是弱苗所在的区域，及时采取对应的措施，改善棉田生长环境，确保该区域在下一阶段能有所改善。</p>
        <div class="tr mt20">
          <p>新疆疆天航空科技有限公司</p>
          <p>{{ $moment().format('YYYY年MM月DD日') }}</p>
        </div>
      </div>
    </div>
    <div class="float_btn" style="bottom: 90px;" @click="hShow = !hShow">插件</div>
    <div class="float_btn" @click="download()">下载</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dkData: {
        resultList: []
      },
      hShow: true,
      reverseList: [],
      level: []
    };
  },
  created() {
    console.log(this.$route.params);
    if (!this.$route.params) {
      this.$router.push('/home')
      return
    }
    this.dkData = this.$route.params;
    this.reverseList = this.$route.params.resultList.reverse();
    Object.keys(this.$route.params.resultList[0].pieData).forEach(item => {
      this.level.push(item)
    })
  },
  mounted() {
    this.$nextTick(() => {
      this.drawBar();
      this.reverseList.forEach(item => {
        this.drawPie(item)
      })
    });
  },
  computed: {
    getResultTimes() {
      let times = [];
      if (this.dkData.resultList) {
        this.dkData.resultList.forEach(item => {
          times.push(item.acquisition_time);
        });
      }
      return times.join("、");
    }
  },
  methods: {
    // 下载pdf
    download() {
      $('#pdfDom').animate({
        scrollTop: 0
      }, 300, () => {
        var shareContent = $("#pdfSroll_dom")[0];//需要截图的包裹的（原生的）DOM 对象
        var width = shareContent.offsetWidth; //获取dom 宽度
        var height = shareContent.offsetHeight; //获取dom 高度
        var c = document.createElement("canvas"); //创建一个canvas节点
        var scale = 2; //定义任意放大倍数 支持小数
        c.width = width * scale; //定义canvas 宽度 * 缩放
        c.height = height * scale; //定义canvas高度 * 缩放
        c.getContext("2d").scale(scale, scale); //获取context,设置scale 
        var opts = {
          // scale: scale, // 添加的scale参数
          // canvas: c, // 自定义canvas
          // logging: true, // 日志开关
          width: width, // dom原始宽度
          height: height, // dom原始高度
          useCORS: true // 引用外部图片
        };
        html2canvas(shareContent, opts).then(canvas => {
          let contentWidth = canvas.width;
          let contentHeight = canvas.height;
          //一页pdf显示html页面生成的canvas高度;
          let pageHeight = (contentWidth / 592.28) * 841.89;
          //未生成pdf的html页面高度
          let leftHeight = contentHeight;
          //页面偏移
          let position = 0;
          //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
          let imgWidth = 595.28;
          let imgHeight = (592.28 / contentWidth) * contentHeight;
          let pageData = canvas.toDataURL("image/png", 1);
          let pdf = new jsPDF("", "pt", "a4");
          //有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
          //当内容未超过pdf一页显示的范围，无需分页
          if (leftHeight < pageHeight) {
            pdf.addImage(pageData, "JPEG", 0, 0, imgWidth, imgHeight);
          } else {
            // 分页
            while (leftHeight > 0) {
              pdf.addImage(pageData, "JPEG", 0, position, imgWidth, imgHeight);
              leftHeight -= pageHeight;
              position -= 841.89;
              //避免添加空白页
              if (leftHeight > 0) {
                pdf.addPage();
              }
            }
          }
          pdf.save(`${ this.dkData.land_name }地块棉田长势与健康度监测结果报告-${this.$moment().format("MM月DD日")}.pdf`);
        });
      })
    },
    // 绘制柱状图
    drawBar() {
      let legend = [];
      let legendColor = ["#FF0000", "#fcffb6", "#a8e767", "#00b755", "#006d34"];
      let series = [];
      this.reverseList.forEach(item => {
        let data = [];
        legend.push(item.acquisition_time);
        this.level.forEach(xi => {
          let value = item.pieData[xi].dehydratedForm;
          value = String(value).indexOf(".") > -1 ? value.toFixed(2) : value;
          data.push(value);
        });
        series.push({
          name: item.acquisition_time,
          type: "bar",
          label: {
            normal: {
              show: true,
              position: "top"
            }
          },
          data
        });
      });
      // legend.forEach((xi, x) => {
      //   let data = []
      //   reverseList.forEach(ri => {
      //     let value = ri.pieData[xi].dehydratedForm
      //     value = String(value).indexOf('.') > -1 ? value.toFixed(2) : value
      //     data.push(value)
      //   })
      //   series.push({
      //     name: xi,
      //     type:'bar',
      //     itemStyle: {
      //       normal: {
      //         color: legendColor[x]
      //       }
      //     },
      //     data
      //   })
      // })
      let options = {
        tooltip: {
          trigger: "axis"
        },
        legend: {
          data: legend
        },
        toolbox: {},
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: [
          {
            type: "category",
            data: this.level
          }
        ],
        yAxis: [
          {
            type: "value",
            name: "亩"
          }
        ],
        series
      };
      let myChart = this.$echarts.init(this.$refs.line);
      myChart.setOption(options);
    },
    // 绘制饼图
    drawPie(item) {
      let data = []
      this.level.forEach(q => {
        data.push({
          name: q,
          value: String(item.pieData[q].dehydratedForm).indexOf('.') > -1 ? Number(item.pieData[q].dehydratedForm.toFixed(2)) : item.pieData[q].dehydratedForm
        })
      })
      let options = {
        title: {
          text: item.acquisition_time,
          left: 'center'
        },
        legend: {
          orient: "vartical",
          x: "right",
          y: "center",
          data: this.level,
          itemGap: 15,
        },
        tooltip: {
          trigger: "item",
          formatter: "{b}: {c}",
          confine: true
        },
        color: [
          "rgb(255,0,0)",
          "rgb(254,254,190)",
          "rgb(182,224,117)",
          "rgb(76,176,92)",
          "rgb(0,104,55)"
        ],
        series: [
          {
            type: "pie",
            center: ["50%", "50%"],
            radius: [0, "60%"],
            label: {
              normal: {
                show: true,
                position: "top",
                formatter: "{d}%",
                textStyle: {
                  color: "#000"
                }
              },
              emphasis: {
                show: true
              }
            },
            labelLine: {
              normal: {
                length: 5,
                length2: 5
              }
            },
            data
          }
        ]
      };
      item.myChart = this.$echarts.init(this.$refs[`${item.jobId}_${item.acquisition_time}`][0]);
      item.myChart.setOption(options);
    },
    // 返回
    toBack() {
      this.$router.back();
    }
  }
};
</script>

<style lang="scss">
#pdf {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 998;
  background: #fff;
  display: flex;
  flex-direction: column;
  font-size: 24px;
  .logoHeader {
    padding: 15px 10px 12px 52px;
    background-color: #000815;
    background-image: url("../assets/t_bg.jpg");
    background-position-x: 100%;
    background-position-y: 0px;
    background-size: initial;
    background-repeat: no-repeat;
    background-attachment: initial;
    background-origin: initial;
    background-clip: initial;
    height: 34px;
    position: relative;
    .toggleSettings {
      position: absolute;
      left: 10px;
      top: 14px;
      color: #fff;
      background: #22232d;
      border-radius: 40px;
      text-align: center;
      cursor: pointer;
      z-index: 2;
      i {
        margin: 5px;
        width: 24px;
        height: 24px;
        font-size: 18px;
        line-height: 24px;
      }
    }
    .appTitle {
      font-size: 24px;
      color: #fff;
      text-decoration: none;
    }
  }
}
#pdfDom {
  overflow: auto;
  flex: 1;
  box-sizing: border-box;
  background: #fff;
  #pdfSroll_dom {
    padding: 5%;
    background: #fff;
  }
  .charts {
    height: 600px; /*no*/
  }
  h2 {
    text-align: center;
    margin-bottom: 10px;
  }
  h3 span {
    font-weight: 500;
  }
  p {
    overflow: hidden;
  }
  .r {
    float: right;
  }
  .tr {
    text-align: right;
  }
  .mt20 {
    margin-top: 20px;
  }
  .info {
    text-indent: 2em;
  }
  .result_imgs {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    > div {
      flex: 0 0 20%;
      padding: 10px;
      box-sizing: border-box;
      img {
        width: 100%;
      }
      p {
        text-align: center;
      }
    }
  }
  .charts_list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    > div {
      flex: 0 0 33.333333%;
      padding: 10px;
      box-sizing: border-box;
      height: 300px;
    }
  }
}
.float_btn {
  position: fixed;
  right: 20px; /*no*/
  bottom: 20px; /*no*/
  width: 60px; /*no*/
  height: 60px; /*no*/
  line-height: 60px; /*no*/
  font-size: 16px; /*no*/
  text-align: center;
  cursor: pointer;
  background: #409eff;
  border-radius: 50%;
  color: #fff;
  box-shadow: 0 1px 3px #666; /*no*/
  &:hover {
    background: #66b1ff;
  }
  &:active {
    background: #3a8ee6;
  }
}
</style>