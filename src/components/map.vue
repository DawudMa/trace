<template>
  <div id="map">
    <div class="csk">
      <el-transfer
        style="text-align: left; display: inline-block"
        v-model="cskValue"
        :filterable="false"
        :titles="['所有通行记录', '轨迹重现']"
        :button-texts="['←删除', '添加→']"
        :format="{
            noChecked: '${total}',
            hasChecked: '${checked}/${total}'
          }"
        @change="handleChange"
        :data="cskData"
      >

      </el-transfer>
    </div>
  </div>
</template>

<script>
import map from "../utils/arcgisInit";

export default map;
</script>

<style lang="scss">
#map {
  width: 100%;
  height: 100%;
  position: relative;
  .csk {
    position: absolute;
    z-index: 1;
    background: #ebebeb;
    padding: 15px;
    border-radius: 5px;
    border: solid 2px #a5a9b1;
    top: 4%;
    left: 2%;
    .transfer-footer {
      margin-left: 20px;
      padding: 6px 5px;
    }
  }
  .el-transfer-panel__list {
    height: 380px;
  }
  .el-transfer-panel {
    width: 300px;
    height: 400px;
  }
  .tools_show {
    position: absolute;
    left: 10px;
    top: 10px;
    z-index: 1;
    > div {
      width: 40px;
      line-height: 40px;
      background: #3b3d4d;
      text-align: center;
      margin-bottom: 10px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
      cursor: pointer;
      &:hover i {
        color: #b6bf00;
      }
      i {
        color: #fff;
        font-size: 20px;
        line-height: 40px;
        font-weight: 700;
      }
    }
  }
  .tools {
    width: 25%;
    max-height: calc(100% - 20px);
    overflow: hidden;
    background: #3b3d4d;
    z-index: 1;
    color: #868fa0;
    position: fixed;
    left: 10px;
    top: 10px;
    box-shadow: 0 2px 5px #000;
    transform-origin: 0 0;
    .logoHeader {
      padding: 15px 10px 12px 52px;
      background: url("../assets/t_bg.jpg") 0 0 no-repeat;
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
          font-size: 14px;
          line-height: 24px;
        }
      }
      .appTitle {
        font-size: 24px;
        color: #fff;
        text-decoration: none;
      }
    }
    .tab-list {
      margin: 0;
      padding: 0;
      list-style: none;
      background-color: #070c15;
      li {
        text-align: center;
        list-style: none;
        cursor: pointer;
        color: #eee;
        display: table-cell;
        width: 1%;
        padding: 5px 10px;
        border-bottom: 4px solid transparent;
        &.tab-selected {
          color: #fff;
          border-color: #b6bf00;
        }
        i {
          font-size: 18px;
          fill: #aaa;
          width: 18px;
          height: 18px;
          margin: 0 5px 5px 0;
        }
      }
    }
    .tabPanelContainer {
      overflow: hidden;
      .tabPane_item {
        display: none;
        padding: 10px;
        color: #eee;
        &.active {
          display: block;
        }
        header {
          border-bottom: 2px solid #b6bf00;
          padding-bottom: 10px;
          i {
            float: right;
            font-size: 18px;
            cursor: pointer;
            &.active,
            &:hover {
              color: #b6bf00;
            }
          }
        }
        .search_dk {
          margin-top: 10px;
          padding: 0 10px;
          input {
            background: transparent;
            border: none;
            color: #909399;
            width: 80%;
            line-height: 30px;
            font-size: 14px;
            box-sizing: border-box;
            &:focus {
              outline: none;
            }
          }
          i {
            float: right;
            font-size: 18px;
            cursor: pointer;
            margin-right: 5px;
            line-height: 30px;
            &.active,
            &:hover {
              color: #b6bf00;
            }
            &.m0 {
              margin: 0;
            }
          }
        }
        .dk_list {
          &::-webkit-scrollbar {
            display: none;
          }
          .dk_item {
            padding: 10px;
            border-bottom: 1px solid #909399;
            &:last-child {
              border: none;
            }
            p {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            span {
              display: inline-block;
              width: 80%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            i {
              float: right;
              font-size: 18px;
              cursor: pointer;
              margin-right: 5px;
              &.active,
              &:hover {
                color: #b6bf00;
              }
              &.m0 {
                margin: 0;
              }
            }
          }
        }
        .result_list {
          .result_item {
            display: flex;
            flex-direction: column;
            padding: 10px;
            margin-bottom: 10px;
            background: hsla(0, 0%, 100%, 0.05);
            height: calc((100vh - 200px) / 3);
            box-sizing: border-box;
            &:last-child {
              margin: 0;
            }
            .title {
              margin-bottom: 10px;
              span {
                display: inline-block;
                width: 80%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              i {
                float: right;
                font-size: 20px;
                cursor: pointer;
                margin-right: 5px;
                &.active,
                &:hover {
                  color: #b6bf00;
                }
                &.m0 {
                  margin: 0;
                }
              }
            }
            .info {
              flex: 1;
              overflow: hidden;
              display: flex;
              .left_pie {
                flex: 0 0 50%;
              }
              .right_swiper {
                flex: 1;
                li {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
                  &.active,
                  &:hover {
                    color: #b6bf00;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  .draw_dom {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1;
    > div {
      width: 40px;
      line-height: 40px;
      background: #3b3d4d;
      text-align: center;
      margin-bottom: 10px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
      cursor: pointer;
      &:hover i {
        color: #b6bf00;
      }
      i {
        color: #fff;
        font-size: 20px;
        line-height: 40px;
        font-weight: 700;
      }
    }
  }
  .form-item-100 {
    width: 100%;
  }
  #search {
    position: absolute;
    z-index: 1;
    top: 20px;
    left: 70px;
  }
  .rb_img {
    position: absolute;
    right: 20px;
    bottom: 20px;
    z-index: 1;
  }
  .mj {
    margin-bottom: 10px;
    text-align: right;
    font-size: 14px;
    color: red;
  }
}
.computer_progress {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  width: 30%;
  z-index: 32;
}

.fade-scale-leave-active,
.fade-scale-enter-active {
  transition: all 0.3s;
}

.fade-scale-enter,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0);
}

.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s;
  position: absolute;
  top: 0;
  left: 0;
}

.fade-transform-enter,
.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.GraphicTips {
  width: auto;
  height: 25px;
  background-color: #000000bd;
  border-radius: 5px;
  text-align: center;
  font-size: 13px;
  color: #fff;
  line-height: 23px;
  cursor: default;
  z-index: 1001;
}
.GraphicTips::before {
  content: "";
  position: absolute;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 8px solid #424242;
  top: 8px;
  transform: rotate(-90deg);
  left: -10px;
  z-index: 1001;
}
.GraphicTips_guiji {
  width: auto;
  //height: 25px;
  background-color: #000000bd;
  border-radius: 5px;
  text-align: center;
  font-size: 13px;
  color: #fff;
  line-height: 23px;
  cursor: default;
  z-index: 1001;
}
.GraphicTips_guiji::before {
  content: "";
  position: absolute;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 8px solid #424242;
  top: 8px;
  transform: rotate(-90deg);
  left: -10px;
  z-index: 1001;
}
</style>

