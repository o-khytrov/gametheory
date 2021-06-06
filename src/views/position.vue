<template>
  <div id="position">
    <h3>Position game</h3>
    <vue-tree
      v-if="renderComponent"
      style="width: 100%; height: 600px; border: 1px solid gray"
      :dataset="gameTree"
      :config="treeConfig"
    >
      <template v-slot:node="{ node, collapsed }">
        <span>{{ node.name }}</span>
        <span
          v-bind:class="[
            node.optimal_1 ? 'optimal_1' : '',
            node.optimal_2 ? 'optimal_2' : '',
            'tree-node',
          ]"
          :style="{ border: collapsed ? '2px solid grey' : '' }"
          >{{ node.player }}</span
        >
        <input
          type="text"
          v-if="node.wins && !node.player"
          v-model="node.wins[0]"
          style="width: 30px"
        />
        <input
          type="text"
          v-if="node.wins && !node.player"
          v-model="node.wins[1]"
          style="width: 30px"
        />
        <span
          style="color: green"
          class="position-choise"
          v-if="node.wins && node.player"
          >{{ node.wins[0] }},</span
        >
        <span
          style="color: blue"
          class="position-choise"
          v-if="node.wins && node.player"
          >{{ node.wins[1] }}</span
        >
      </template>
    </vue-tree>
    <button v-on:click="solve" class="btn btn-primary">Solve</button>
  </div>
</template>

<script>
export default {
  name: "treemap",
  data() {
    return {
      gameTree: {
        name: "0",
        player: 1,
        children: [
          {
            player: 2,
            name: "A",
            children: [
              {
                player: 1,
                name: "D",
                children: [
                  {
                    player: 2,
                    name: "H",
                    children: [
                      {
                        player: 1,
                        name: "X",
                        children: [
                          { name: "a", wins: [0, 4] },
                          { name: "b", wins: [2, 3] },
                        ],
                      },
                      { name: "m", wins: [3, -4] },
                    ],
                  },
                  { name: "p", wins: [1, 1] },
                ],
              },
              {
                player: 1,
                name: "E",
                children: [
                  { name: "n", wins: [1, 4] },
                  {
                    name: "Y",
                    player: 2,
                    children: [
                      { name: "c", wins: [-4, -6] },
                      { name: "d", wins: [-3, -1] },
                    ],
                  },
                ],
              },
            ],
          },
          {
            player: 2,
            name: "B",
            children: [
              { name: "r", wins: [0, 2] },
              { name: "t", wins: [4, -7] },
              { name: "w", wins: [-4, 2] },
            ],
          },
          {
            player: 1,
            name: "C",
            children: [
              {
                name: "F",
                player: 2,
                children: [
                  { name: "l", wins: [2, 1] },
                  { name: "j", wins: [4, 5] },
                ],
              },
              {
                name: "G",
                player: 2,
                children: [
                  {
                    name: "K",
                    player: 1,
                    children: [
                      { name: "k", wins: [2, 4] },
                      {
                        name: "Z",
                        player: 2,
                        children: [
                          { name: "f", wins: [-5, 1] },
                          { name: "g", wins: [-2, 3] },
                          { name: "h", wins: [1, 7] },
                        ],
                      },
                    ],
                  },

                  { name: "s", wins: [3, -1] },
                ],
              },
            ],
          },
        ],
      },
      treeConfig: { nodeWidth: 120, nodeHeight: 80, levelHeight: 80 },
      renderComponent: true,
    };
  },
  methods: {
    forceRerender() {
      // Remove my-component from the DOM
      this.renderComponent = false;

      this.$nextTick(() => {
        // Add the component back in
        this.renderComponent = true;
      });
    },
    // метод зворотної індукції
    backwardInductin: function (node) {
      //якщо не має наступтних рівнів, вихід
      if (!node.children) return;
      // максимальний виграш
      var max_pay_off = Number.NEGATIVE_INFINITY;
      // кращий вибір
      var best_choise = node.children[0];
      
      node.children.forEach((child) => {
        //для кожного з підпорядкованих рівнів, 
        //якщо це не кінцева позиція, рекурсивний виклик 
        if (!child.wins) this.backwardInductin(child);
        //якщо це кінцева позиція, визначаємо виграш гравця, якому належить хід на вищому рівні
        var pay_off = child.wins[node.player - 1];
        if (child.wins[node.player - 1] > max_pay_off) {
          max_pay_off = pay_off;
          best_choise = child;
        }
        //вибираємо кращий вибір і
      });
      //позначаємо позицію як "обрану" гравцем
      best_choise["optimal_" + node.player] = true;
      //переносимо виграші на вищий рівень
      node.wins = best_choise.wins;
    },
    solve: function () {
      var bestUtil = this.backwardInductin(this.gameTree);
      console.log(bestUtil);
      console.log(this.gameTree);
      this.forceRerender();
    },
  },
};
</script>

