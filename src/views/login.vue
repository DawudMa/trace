<template>
  <div class="login_main">
    <div class="login_container">
      <p class="f20">— DingWei Spatial —</p>
      <div class="login_form">
        <div class="login_item el-input el-input-group el-input-group--prepend">
          <div class="el-input-group__prepend">
            <i class="iconfont icon-yonghu co_bl"></i>
          </div>
          <input placeholder="请输入用户名" type="text" autofocus v-model="userName" class="el-input__inner">
        </div>
        <el-input
          @keyup.native.enter="login"
          placeholder="请输入密码"
          v-model="passWord"
          type="password"
          class="login_item"
        >
          <i slot="prepend" class="iconfont icon-mima co_bl"></i>
        </el-input>
      </div>
      <div class="login_btn f14 fb" @click="login">登录</div>
    </div>
    <div class="bottom_msg">
      <p>© DingWei Spatial</p>
      <p class="zhichi">
        <i class="iconfont icon-dianhua"></i>
        2019
      </p>
    </div>
  </div>
</template>

<script>
import { setToken } from "@/utils/auth";
import { ajaxLogin } from "@/api/api";

export default {
  data() {
    return {
      userName: "",
      passWord: ""
    };
  },
  mounted() {
  },
  methods: {
    getNewDate() {
      setTimeout(() => {
        this.time = this.$moment().format("HH:mm:ss");
        this.week = this.$moment().format("dddd");
        this.date = this.$moment().format("YYYY-MM-DD");
        this.getNewDate();
      }, 1000);
    },
    login() {
      if (!this.userName) {
        this.$alert("请输入用户名", "提示");
        return;
      }
      if (!this.passWord) {
        this.$alert("请输入密码", "提示");
        return;
      }
      ajaxLogin({
        user_name: this.userName,
        user_pwd: this.$md5(this.passWord)
      }).then(res => {
        setToken("user", res.data);
        this.$router.replace("/home");
      });
    }
  }
};
</script>

<style lang="scss">
.login_main {
  width: 100%;
  height: 100%;
  background: #0e305e;
  color: #fff;
  .slide-box {
    position: fixed;
    width: 100%;
    height: 100%;
    background: #0086b3;
    top: 0px;
    left: 0px;
    z-index: 0;
  }
  .slide-box li {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0px;
    left: 0px;
    color: transparent;
    background-size: cover;
    background-position: 50% 50%;
    background-repeat: none;
    opacity: 0;
    z-index: 0;
    animation: imageAnimation 24s linear infinite 0s;
  }
  .login_container {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 400px;
    transform: translate(-50%, -50%);
    text-align: center;
  }
  img,
  p,
  .login_item {
    margin-bottom: 10px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .login_form {
    margin: 20px 0;
    .login_item {
      border: 1px solid #9ac2f7;
      border-radius: 5px;
      overflow: hidden;
    }
    .el-input-group__prepend {
      background-color: transparent;
      border: none;
      border-right: 1px solid #9ac2f7;
    }
    input {
      height: 40px;
      border: none;
      background: transparent;
      color: #fff;
    }
  }
  .login_btn {
    width: 100%;
    margin: 0 auto;
    padding: 15px 0;
    text-align: center;
    background: #0a6bb9;
    border-radius: 5px;
    box-shadow: 0px 2px 1px rgba(28, 28, 29, 0.42);
    cursor: pointer;
    &:active {
      opacity: 0.8;
    }
  }
  .bottom_msg {
    position: absolute;
    bottom: 10px;
    width: 100%;
    text-align: center;
    .zhichi {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      i {
        vertical-align: middle;
      }
    }
  }
}
</style>
