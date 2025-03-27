<template>
  <div class="common-layout">
    <el-container style="height: 100%">
      <el-header>
        <img src="../assets/vue.svg" />
        头部<el-icon><Document /></el-icon><el-icon><Folder /></el-icon>
        <el-button type="primary" @click="handelClick">导出 </el-button>
      </el-header>
      <el-container style="height: calc(100% - 60px)">
        <el-aside width="300px">
          <el-scrollbar class="custom-tree">
            <div ref="dndContainer">
              <el-tree
                style="width: 100%"
                :allow-drag="allowDrag"
                :allow-drop="allowDrop"
                :data="dataList"
                draggable
                default-expand-all
                node-key="id"
                :props="{
                  label: 'name',
                }"
                @node-drag-start="handleDragStart"
                @node-drag-enter="handleDragEnter"
                @node-drag-leave="handleDragLeave"
                @node-drag-over="handleDragOver"
                @node-drag-end="handleDragEnd"
                @node-drop="handleDrop"
              >
                <template #default="{ node, data }">
                  <span class="custom-tree-node1">
                    <el-icon
                      v-if="data.type == 'folder'"
                      style="font-size: 18px"
                      ><Folder
                    /></el-icon>
                    <el-icon v-else style="font-size: 18px"
                      ><Tickets
                    /></el-icon>
                    <span :title="node.label" class="label-tooltip ellipsis">{{
                      node.label
                    }}</span>
                  </span>
                </template>
              </el-tree>
            </div>
          </el-scrollbar>
        </el-aside>
        <el-main>
          <div class="panning-mousewheel-app">
            <div id="app-content" ref="appContent"></div>
            <TeleportContainer />
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script setup>
import { ref, onMounted, defineComponent, reactive } from "vue";
import data from "./data.json";
import { ports, willHaveCycle, data1 } from "./config";
import { Graph, Markup } from "@antv/x6";
import { Snapline } from "@antv/x6-plugin-snapline";
import { Dnd } from "@antv/x6-plugin-dnd";
import TestNode from "./test.vue";
import { register, getTeleport } from "@antv/x6-vue-shape";
import icon_vue from "../assets/vue.svg";
import icon_add from "../assets/add.svg";
import icon_rightAssociation from "../assets/icon_right-association.svg";
import icon_left from "../assets/left.svg";
import icon_inner from "../assets/inner.svg";
import icon_full from "../assets/full.svg";
const appContent = ref(null);
const dndContainer = ref(null);
register({
  shape: "custom-vue-node",
  width: "auto",
  height: "auto",
  component: TestNode,
});
// 注册一个全局自定义边类型
Graph.registerEdge(
  "global-edge",
  {
    inherit: "edge", // 继承基础边类型
    // 定义默认样式
    attrs: {
      line: {
        stroke: "#8f8f8f", // 边颜色（蓝色）
        // strokeDasharray: "5,5", // 虚线样式
        // targetMarker: { name: "block", width: 12, height: 8 }, // 目标箭头
      },
    },
    // 边文本标签配置
    labels: [
      {
        position: 0.5,
        attrs: {
          text: {
            fill: "red", // 文本颜色与边一致
            textAnchor: "middle", // 文本居中
          },
        },
      },
    ],
    // 边交互效果（悬停/选中）
    hover: {
      attrs: {
        line: { stroke: "yellow" }, // 悬停时变为红色
      },
    },
    selected: {
      attrs: {
        line: { strokeWidth: 3 }, // 选中时加粗
      },
    },
  },
  true // 覆盖同名类型
);
Graph.registerEdge(
  "dag-edge",
  {
    inherit: "edge",
    attrs: {
      line: {
        stroke: "#C2C8D5",
        strokeWidth: 1,
        targetMarker: null,
      },
    },
  },
  true
);
Graph.registerEdge(
  "custom-edge-label",
  {
    inherit: "edge",
    defaultLabel: {
      markup: [
        {
          tagName: "rect",
          selector: "body",
        },
        {
          tagName: "text",
          selector: "label",
        },
      ],
      attrs: {
        label: {
          fill: "#000",
          fontSize: 14,
          textAnchor: "middle",
          textVerticalAnchor: "middle",
          pointerEvents: "none",
        },
        body: {
          ref: "label",
          fill: "#ffd591",
          stroke: "#ffa940",
          strokeWidth: 2,
          rx: 4,
          ry: 4,
          refWidth: "140%",
          refHeight: "140%",
          refX: "-20%",
          refY: "-20%",
        },
      },
      position: {
        distance: 0.25,
        options: {
          absoluteDistance: true,
          reverseDistance: true,
        },
      },
    },
  },
  true
);
// 注册自定义边上标签图片
Graph.registerEdge(
  "image-label-edge",
  {
    inherit: "edge",
    // 定义标签结构（使用 SVG image 标签）
    labels: [
      {
        markup: [
          {
            tagName: "image",
            selector: "imgageurl",
          },
        ],
        attrs: {
          imgageurl: {
            "xlink:href": icon_vue,
            // "xlink:href":
            //   "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFMklEQVRYR+2WaWxUVRiGnzt3lntnptPOdGba6ZRS7ALUsFY2g7SyhKWA0ALKHrBgWBRqQioQKJZdVpHdH5jKokGBgopoBCpbIkvYJIoIspUudGEYmHY6c8eMLCHIojVATLjJ+XfP9z75znve7wg84094xvo8B/jfd8AsQZMq2AP4a+On/9KBZqmyvPpnj+enUhhTG/HgnloB6GFU/8YJM40Gg/mjA0dHK7DiaQHEN0CYkzmke8ao+SOYmTk/MGvrj12A7540gDEE+neJi80ZO/0tZ7v+rwOVZMSkuTddvNIKOPWkAV4a1jBu/3sLummi6xmpqizh/O8VZI3e8UeB60ZroPhJAOiA6juFW5vlrV99k9lDY5BAFDm2+wyjx205dNLnG2AymRJdLtevwJl7QGQguEyACqgCKgDPvbAPMqEzCkY6NdpOB2u8fYHLgKZnXJ19+Wc+bQFBLpk9679k8rsfX7e+3MZrMBrD9+Xnr/W4XMcjjVJilD08tq4zMiY03GTTaWVtQPELJUVlyuWzhZeOFhYVXERZDRy5/xY0jYIBHRvEDewz/NWoUJuRqZPW7T10pXRzS4u5w8ylmd3a9G8D1X7Qacib9AknTonkfr6OJYsXUT/iJimpzTHHRgABwAWuIryuMnzVHnw1ApWlHvZvP8GGlQWVWyuuDQG2CREwPNFoHNa1S6OWKV2StInJDkJC/Cg1XorOlXPxTCUxDevgiLdzo+IqNdfKELwlrFpwmMjkMYyYNY0ZM6bx5tAEHFFq3L8c4dql01Rdr0AjmZBCLaj1JrSGUDSSjE6vpiD/HJPHrT27z+NuFTyCVxJFMXvMoLZpaekRhJo8uCt9+Lw1CHjRaDQoiPj8IKol1JIOQ5jEqnlHCU3sxdD3c8jJzmJAiwtY9T4EKQSjIw5DZCxanRFkAyjgdRXjdZVjtEaD3kBWxyks3nui310PqGB8rzrWKeOyUy3J7euhlqz4FQMBRSEQ8COogj4S8N6oxO8+zcoPjqB/oTudR2WyYtFcsnpL2BwOVDrDrXjz3+piTc1NqsqKCfi9mOomIVscqIUq5o1dw8SNB7LuN2GjeEHMGdYzKSN9UALRCTEIchwIOqrdZfg9blQ6CcF3gSW5uxCdnWiakc6OTWvITtdhDNHj94sEVEGjiqAIBEQBtU6PWjbi93sRUOG7fp4lU75m5s6zfwO4Y8zBaZGm3IG9bHWTW8iExaWgtTVBo9WhUmtwnd7C0tk7uWpuT6u+vfn+szWBpOqTQp1oPXaHCZvDhMlqRh9mxRBuRyOF4PepUNChxsPpfRtZNPs31l9yjX3ULIirhzBncIq9z2v9HMQmp2KMCaauSNnxPJbN2Myuy9HlSZ1TLMcOHjp78PDhhWEQHymKjZ2y2CDSoolwOnRiRIQOq02L3WnBEWPD5ykl/4vz7D+s1Pzgrmz/uGGk0sDbfeuZc9/IkEzNU1rjbDsV9+UCFr+Ty/Sd5XMFWS4ON5uTCwsLB9++f1rACsSroGkYNI4U1UkOvTYxVBYssloreKq07C0vziuBkY8DuBNa7doapeVDu6pf7NivDbb6HViW/SFTtl+Z44WJt9PuJuB7SCTrATvQUA/NvODzQR5Q9E8BgnWj6wvi8mGdQnr0Tjfw7Q6FCZuvzPfChNrOgdq8B3QWmD0+1ZJlCtEwaVvxspsw9mkC/KUlw/jeDvvC3cVXNxQqysCnDhAUlGCkXaVqcUFRRj3i7B/L9m888KBiDqAM8D5W6SE//FeA2ure3fcc4HkH/gSNF7Qt0mUkowAAAABJRU5ErkJggg==",
            width: 32,
            height: 32,
            x: -16,
            y: -16,
          },
        },
        position: {
          distance: 0.5,
          angle: 0,
        },
      },
    ],
  },
  true
);
const TeleportContainer = defineComponent(getTeleport());
let graph;
let dnd;
onMounted(() => {
  if (graph) {
    graph.dispose();
  }
  graph = new Graph({
    container: appContent.value,
    background: {
      color: "#F2F7FA",
    },
    grid: {
      visible: true,
      type: "doubleMesh",
      args: [
        {
          color: "#eee", // 主网格线颜色
          thickness: 1, // 主网格线宽度
        },
        {
          color: "#ddd", // 次网格线颜色
          thickness: 1, // 次网格线宽度
          factor: 4, // 主次网格线间隔
        },
      ],
    },
    connecting: {
      router: "manhattan",
      connector: {
        name: "rounded",
        args: {
          radius: 8,
        },
      },
      anchor: "center",
      // connectionPoint: "anchor",
      snap: {
        radius: 20,
      },
      // 是否允许输入端口，false表示不允许
      allowPort: true, // boolean
      // 是否允许多对多连接，false表示不允许
      allowMulti: false, // boolean
      // 是否允许空连接，false表示不允许
      allowBlank: false, // boolean
      // 是否允许循环连接，false表示不允许
      allowLoop: false, // boolean
      // 是否允许连线到边，true表示允许
      allowNode: false, // boolean
      // 是否允许边连接，true表示允许
      allowEdge: false, // boolean
      createEdge() {
        return this.createEdge({
          shape: "image-label-edge",
          attrs: {
            line: {
              stroke: "#8f8f8f",
              strokeWidth: 1,
            },
          },
          // shape: "custom-edge-label",
          // attrs: {
          //   line: {
          //     stroke: "#ccc",
          //   },
          // },
          // labels: [
          //   {
          //     attrs: {
          //       line: {
          //         stroke: "#73d13d",
          //       },
          //       text: {
          //         text: "Custom Label",
          //       },
          //     },
          //   },
          // ],
          // shape: "global-edge",
          // label: "你好",
          // attrs: {
          //   line: {
          //     strokeDasharray: "5 5",
          //   },
          // },
          // zIndex: -1,
        });
      },
      validateConnection({
        sourceCell,
        targetCell,
        sourceMagnet,
        targetMagnet,
      }) {
        /**校验是否有循环连接 */
        let falg = willHaveCycle(graph, sourceCell, targetCell);
        return !falg;
      },
      // validateEdge: function ({edge}) {
      //   const source = edge.getSourceCell();
      //   const target = edge.getTargetCell();
      //   // 检查是否已经存在从 source 到 target 的边
      //   const existingEdges = graph
      //     .getEdges()
      //     .filter(
      //       (e) => e.getSourceCell() === source && e.getTargetCell() === target
      //     );
      //   if (existingEdges.length > 0) {
      //     alert("Edge already exists between these nodes!");
      //     return false;
      //   }
      //   return true;
      // },
    },
    autoResize: true,
    panning: true,
    mousewheel: {
      enabled: true,
      modifiers: "Ctrl",
      maxScale: 4,
      minScale: 0.2,
    },
    highlighting: {
      // 当连接桩可以被链接时，在连接桩外围渲染一个 2px 宽的红色矩形框
      magnetAvailable: {
        name: "stroke",
        args: {
          padding: 4,
          attrs: {
            "stroke-width": 2,
            stroke: "red",
          },
        },
      },
      // 连接桩吸附连线时在连接桩外围围渲染一个包围框
      magnetAdsorbed: {
        name: "stroke",
        args: {
          attrs: {
            fill: "#fff",
            stroke: "#31d0c6",
            strokeWidth: 4,
          },
        },
      },
    },
  });
  graph.use(
    new Snapline({
      enabled: true,
    })
  );
  // 3. 添加边（必须指定 shape）
  dnd = new Dnd({
    target: graph,
    scaled: false,
    dndContainer: dndContainer.value,
    //拖拽开始时，获取被拖拽的节点，默认克隆 dnd.start 传入的节点。
    getDragNode: (node) => node.clone({ keepId: true }),
    //拖拽结束时，获取放置到目标画布的节点，默认克隆被拖拽的节点。
    //在这里做一些处理，比如修改节点数据等。
    getDropNode: (node) => node.clone({ keepId: true }),
  });
  // graph.fromJSON(data1);
  graph.centerContent();
  // 控制连接桩显示/隐藏
  const showPorts = (ports, show) => {
    for (let i = 0, len = ports.length; i < len; i = i + 1) {
      ports[i].style.visibility = show ? "visible" : "hidden";
    }
  };

  graph.on("cell:mouseenter", ({ cell }) => {
    const ports = appContent.value.querySelectorAll(".x6-port-body");
    showPorts(ports, true);
    if (cell.isNode()) {
      cell.addTools([
        {
          name: "boundary",
          args: {
            attrs: {
              // fill: "#7c68fc",
              stroke: "#333",
              "stroke-width": 1,
              "fill-opacity": 0.2,
            },
          },
        },
        {
          name: "button-remove",
          args: {
            x: 0,
            y: 0,
            // offset: { x: -10, y: -10 },
          },
        },
      ]);
    } else {
      // cell.addTools(['vertices', 'segments'])
      cell.addTools([
        { name: "boundary" },
        {
          name: "button-remove", // 工具名称
          args: { distance: 20 }, // 工具对应的参数
        },
      ]);
    }
  });

  graph.on("cell:mouseleave", ({ cell }) => {
    // const container = document.getElementById("graph-container");
    const ports = appContent.value.querySelectorAll(".x6-port-body");
    showPorts(ports, false);
    cell.removeTools();
  });
  graph.on("node:click", (node) => {
    // 判断target的className或者id，或者你定义的一些自定义属性，
    // 反正只要你能知道当前点击的区域是属于谁的就行
    // 我在vue节点点击事件的标签上加了个class
    if (
      node.e.target.classList &&
      [...node.e.target.classList].includes("click_target")
    )
      return;
    console.log(node);
  });
  graph.on("node:added", ({ node, index, options }) => {
    console.log("node:added");
  });
  graph.on("node:removed", ({ node, index, options }) => {
    console.log(node, index, options);
  });
  // graph.on("edge:mouseenter", ({ cell }) => {
  //   cell.addTools([
  //     {
  //       name: "source-arrowhead",
  //     },
  //     {
  //       name: "target-arrowhead",
  //       args: {
  //         attrs: {
  //           fill: "#3370ff",
  //         },
  //       },
  //     },
  //   ]);
  // });

  // graph.on("edge:mouseleave", ({ cell }) => {
  //   cell.removeTools();
  // });
  graph.on("edge:connected", ({ edge }) => {
    edge.setLabels([
      {
        markup: [
          {
            tagName: "image",
            selector: "imgageurl",
          },
        ],
        attrs: {
          imgageurl: {
            "xlink:href": icon_add,
            // "xlink:href":
            //   "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFMklEQVRYR+2WaWxUVRiGnzt3lntnptPOdGba6ZRS7ALUsFY2g7SyhKWA0ALKHrBgWBRqQioQKJZdVpHdH5jKokGBgopoBCpbIkvYJIoIspUudGEYmHY6c8eMLCHIojVATLjJ+XfP9z75znve7wg84094xvo8B/jfd8AsQZMq2AP4a+On/9KBZqmyvPpnj+enUhhTG/HgnloB6GFU/8YJM40Gg/mjA0dHK7DiaQHEN0CYkzmke8ao+SOYmTk/MGvrj12A7540gDEE+neJi80ZO/0tZ7v+rwOVZMSkuTddvNIKOPWkAV4a1jBu/3sLummi6xmpqizh/O8VZI3e8UeB60ZroPhJAOiA6juFW5vlrV99k9lDY5BAFDm2+wyjx205dNLnG2AymRJdLtevwJl7QGQguEyACqgCKgDPvbAPMqEzCkY6NdpOB2u8fYHLgKZnXJ19+Wc+bQFBLpk9679k8rsfX7e+3MZrMBrD9+Xnr/W4XMcjjVJilD08tq4zMiY03GTTaWVtQPELJUVlyuWzhZeOFhYVXERZDRy5/xY0jYIBHRvEDewz/NWoUJuRqZPW7T10pXRzS4u5w8ylmd3a9G8D1X7Qacib9AknTonkfr6OJYsXUT/iJimpzTHHRgABwAWuIryuMnzVHnw1ApWlHvZvP8GGlQWVWyuuDQG2CREwPNFoHNa1S6OWKV2StInJDkJC/Cg1XorOlXPxTCUxDevgiLdzo+IqNdfKELwlrFpwmMjkMYyYNY0ZM6bx5tAEHFFq3L8c4dql01Rdr0AjmZBCLaj1JrSGUDSSjE6vpiD/HJPHrT27z+NuFTyCVxJFMXvMoLZpaekRhJo8uCt9+Lw1CHjRaDQoiPj8IKol1JIOQ5jEqnlHCU3sxdD3c8jJzmJAiwtY9T4EKQSjIw5DZCxanRFkAyjgdRXjdZVjtEaD3kBWxyks3nui310PqGB8rzrWKeOyUy3J7euhlqz4FQMBRSEQ8COogj4S8N6oxO8+zcoPjqB/oTudR2WyYtFcsnpL2BwOVDrDrXjz3+piTc1NqsqKCfi9mOomIVscqIUq5o1dw8SNB7LuN2GjeEHMGdYzKSN9UALRCTEIchwIOqrdZfg9blQ6CcF3gSW5uxCdnWiakc6OTWvITtdhDNHj94sEVEGjiqAIBEQBtU6PWjbi93sRUOG7fp4lU75m5s6zfwO4Y8zBaZGm3IG9bHWTW8iExaWgtTVBo9WhUmtwnd7C0tk7uWpuT6u+vfn+szWBpOqTQp1oPXaHCZvDhMlqRh9mxRBuRyOF4PepUNChxsPpfRtZNPs31l9yjX3ULIirhzBncIq9z2v9HMQmp2KMCaauSNnxPJbN2Myuy9HlSZ1TLMcOHjp78PDhhWEQHymKjZ2y2CDSoolwOnRiRIQOq02L3WnBEWPD5ykl/4vz7D+s1Pzgrmz/uGGk0sDbfeuZc9/IkEzNU1rjbDsV9+UCFr+Ty/Sd5XMFWS4ON5uTCwsLB9++f1rACsSroGkYNI4U1UkOvTYxVBYssloreKq07C0vziuBkY8DuBNa7doapeVDu6pf7NivDbb6HViW/SFTtl+Z44WJt9PuJuB7SCTrATvQUA/NvODzQR5Q9E8BgnWj6wvi8mGdQnr0Tjfw7Q6FCZuvzPfChNrOgdq8B3QWmD0+1ZJlCtEwaVvxspsw9mkC/KUlw/jeDvvC3cVXNxQqysCnDhAUlGCkXaVqcUFRRj3i7B/L9m888KBiDqAM8D5W6SE//FeA2ure3fcc4HkH/gSNF7Qt0mUkowAAAABJRU5ErkJggg==",
            width: 32,
            height: 32,
            x: -16,
            y: -16,
          },
        },
        position: {
          distance: 0.5,
          angle: 0,
        },
      },
    ]);
    // const sourceId = edge.getSourceCellId();
    // const targetId = edge.getTargetCellId();
  });
});
const handleDragEnter = (draggingNode, dropNode, ev) => {
  console.log("tree drag enter:", dropNode.label);
};
const handleDragLeave = (draggingNode, dropNode, ev) => {
  console.log("tree drag leave:", dropNode.label);
};
const handleDragOver = (draggingNode, dropNode, ev) => {
  console.log("tree drag over:", dropNode.label);
};
const handleDragEnd = (draggingNode, dropNode, dropTypeDropType, ev) => {
  console.log("tree drag end:");
};

const handleDragStart = (treeNode, ev) => {
  const node = graph.createNode({
    shape: "custom-vue-node",
    width: 200,
    height: 36,
    id: treeNode?.data.id,
    // 传递给自定义节点的数据
    data: {
      ...treeNode.data,
    },
    ports: {
      ...ports,
    },
  });
  dnd.start(node, ev);
};
const handleDrop = (draggingNode, dropNode, dropTypeDropType, ev) => {
  return false;
};
const allowDrag = (draggingNode) => {
  return draggingNode.data.type != "folder";
};
const handelClick = () => {
  console.log(graph.toJSON());
};
const dataList = data.data;
</script>
<style scoped>
.common-layout {
  height: 100vh;
  width: 100vw;
}

.common-layout .el-header,
.common-layout .el-footer {
  background-color: var(--el-color-primary-light-7);
  color: var(--el-text-color-primary);
}

.common-layout .el-main {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-text-color-primary);
  height: 100%;
  overflow: hidden;
}

.common-layout .el-aside {
  background-color: var(--el-color-primary-light-8);
  color: var(--el-text-color-primary);
  height: 100%;
  overflow-y: auto;
}
.custom-tree {
  height: calc(100% - 10px);
  padding: 0 0 0 8px;
}
.custom-tree .ed-tree-node__content {
  height: 40px;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
}
.custom-tree .ed-tree-node__content:hover {
  background: rgba(31, 35, 41, 0.1);
  border-radius: 4px;
}
.custom-tree-node1 {
  width: calc(100% - 30px);
  display: flex;
  align-items: center;
  box-sizing: content-box;
  padding-right: 4px;
}
.custom-tree-node1 .icon-more {
  margin-left: auto;
  display: none;
}
.custom-tree-node1 .label-tooltip {
  width: 100%;
  margin-left: 8.75px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.panning-mousewheel-app {
  display: flex;
  width: 100%;
  height: 100%;
  padding: 0;
  font-family: sans-serif;
}
#app-content {
  flex: 1;
  margin-right: 8px;
  margin-left: 8px;
  border-radius: 5px;
  box-shadow: 0 12px 5px -10px rgb(0 0 0 / 10%), 0 0 4px 0 rgb(0 0 0 / 10%);
}
</style>
