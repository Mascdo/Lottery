import 'babel-polyfill';
import Base from './lottery/base.js';
import Timer from './lottery/timer.js';
import Calculate from './lottery/calculate.js';
import Interface from './lottery/interface.js';
import $ from 'jquery';

// 深度拷贝
const copyProperties = function(target, source) {
  // 有时候object拿不到的东西，reflect可以拿到
  for(let key of Reflect.ownKeys(source)){
    if(key!=='constructor' && key !== 'prototype' && key != 'name'){
      let desc = Object.getOwnPropertyDescriptor(source, key);
      Object.defineProperty(target, key, desc);
    }
  }
}

// 多重继承的方法
const mix = function(...mixins){
  class Mix{}
  for(let mixin of mixins){
    // 将一个类拷贝到另一个类上去
    copyProperties(Mix, mixin);
    // 拷贝原型
    copyProperties(Mix.prototype, mixin.prototype);
  }
  return Mix;
}

class Lottery extends mix(Base,Calculate,Interface,Timer){
  // 名称 中文名称 期号 状态
  constructor(name = 'syy',cname = '11选5',issue = '**',state = '**'){
    super(); // 调用父构造方法
    this.name = name;
    this.cname = cname;
    this.issue = issue;
    this.state = state;
    this.el = '';
    this.omit = new Map(); // 遗漏
    this.open_code = new Set(); // 开奖号码
    this.open_code_list = new Set(); // 开奖记录
    this.play_list = new Map(); // 玩法
    this.number = new Set(); // 选号
    this.issue_el = '#curr_issue'; // 期号选择器
    this.countdown_el = '#countdown'; // 倒计时选择器
    this.state_el = '.state_el';  // 状态选择器
    this.cart_el = '.codelist'; // 购物车选择器
    this.omit_el = ''; // 遗漏选择器
    this.cur_play = 'r5';
    this.initPlayList(); // 玩法初始化
    this.initNumber(); // 选号初始化
    this.updateState(); // 更新状态
    this.initEvent(); // 事件初始化

  }

    updateState(){
      let self = this;
      this.getState().then(function(res){
        self.issue = res.issue; // 最新期号
        self.end_time = res.end_time; // 最新期号
        self.state = res.state; // 当前状态
        // 更新当前期号
        $(self.issue_el).text(res.issue);
        // 更新倒计时
        self.countdown(res.end_time, function(time){
          $(self.countdown_el).html(time);
        }, function(){
          setTimeout(function(){
            self.updateState();
            self.getOmit(self.issue).then(function(res){

            });
            // 更新开奖号
            self.getOpenCode(self.issue).then(function(res){

            })
          }, 500)
        })
      })
    }

    /**
   * [initEvent 初始化事件]
   * @return {[type]} [description]
   */
    initEvent(){
      let self = this;
      $('#plays').on('click', 'li', self.changePlayNav.bind(self));
      $('.boll-list').on('click', '.btn-boll', self.toggleCodeActive.bind(self));
      $('#confirm_sel_code').on('click', self.addCode.bind(self));
      // 大小奇偶
      $('.dxjo').on('click', 'li', self.assistHandle.bind(self));
      // 随机期数
      $('.qkmethod').on('click','.btn-middle', self.getRandomCode.bind(self));
    }
  }

  export default Lottery;
