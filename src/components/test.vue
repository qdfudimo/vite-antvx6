<template>
  <div class="custom_text" :title="node?.data.name">
    <el-icon><Coin /></el-icon>
    <div class="text_content">&nbsp;&nbsp;{{ node?.data.name }}</div>
    <div class="popver_more click_target" @click="handelClick">
      <svg class="click_target" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
        <path
          fill="currentColor"
          d="M512 160c320 0 512 352 512 352S832 864 512 864 0 512 0 512s192-352 512-352m0 64c-225.28 0-384.128 208.064-436.8 288 52.608 79.872 211.456 288 436.8 288 225.28 0 384.128-208.064 436.8-288-52.608-79.872-211.456-288-436.8-288zm0 64a224 224 0 1 1 0 448 224 224 0 0 1 0-448m0 64a160.192 160.192 0 0 0-160 160c0 88.192 71.744 160 160 160s160-71.808 160-160-71.744-160-160-160"
        ></path>
      </svg>
      <!-- <el-icon class="rotate_more"><MoreFilled /></el-icon> -->
    </div>
  </div>
</template>
<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "ProgressNode",
  inject: ["getNode"],
  data() {
    return {
      percentage: 80,
      node: null,
    };
  },
  mounted() {
    const node = this.getNode();
    this.node = node;
    // console.log(node);
    // node.on("change:data", ({ current }) => {
    //   console.log("节点数据是否发生变化了 >>>", current);
    // });
  },
  methods: {
    handelClick() {
      console.log(13213);
    },
  },
});
</script>
<style>
.custom_text {
  width: 200px;
  height: 36px;
  padding: 0 6px;
  border: 1px solid #8f8f8f;
  display: flex;
  align-items: center;
  line-height: 34px;
  border-radius: 6px;
  box-sizing: border-box;
  border-left: 4px solid #3370ff;
  background-color: #fff;
}
.text_content {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.popver_more {
  position: relative;
  height: 100%;
  cursor: pointer;
  width: 16px;
  display: flex;
  align-items: center;
}
.rotate_more {
  transform: rotate(90deg);
}
</style>
