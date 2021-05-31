<template>
  <div id="zero-sum" class="container">
    <h3>Zero-sum game</h3>
    <table class="table table-hover table-bordered bimatrix-table">
      <thead>
        <tr>
          <th></th>
          <th v-for="(col, c) in matrix[0]" class="colmax">
            B<sub>{{ c }}</sub>
          </th>
          <th>min</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, r) in matrix">
          <th class="rowmax">
            A<sub>{{ r }}</sub>
          </th>
          <td v-for="(cell, c) in row">
            <input type="number" v-model="matrix[r][c]" />
          </td>

          <td>{{ rowsTotals[r] }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th>max</th>
          <td v-for="t in colsTotals">
            {{ t }}
          </td>
        </tr>
      </tfoot>
    </table>

    <button class="btn btn-primary" v-on:click="solve">Solve</button>

    <div v-if="solved" class="mt-3">
      <div>
        Нижня ціна гри {{ solution.bottomPrice }}
        <span>(Максимальний мінімум)</span>
      </div>
      <div>
        Верхня ціна гри {{ solution.topPrice }}
        <span>(Мінімальний максимум)</span>
      </div>
      <div class="row">
        <div class="col-6">
          <div>{{ solution.a.f }}</div>
          <div v-for="eq in solution.a.constraints">{{ eq }}</div>
          <div>Solution</div>
          <div v-for="v in solution.a.variables">
            {{ v }}={{ solution.a.result[v].toFixed(2) }}
          </div>
          <div>probabilities</div>
          <div v-for="(p, i) in solution.a.probabilities">{{ i }}={{ p.toFixed(2) }}</div>
        </div>
        <div class="col-6">
          <div>{{ solution.b.f }}</div>
          <div v-for="eq in solution.b.constraints">{{ eq }}</div>
          <div>Solution</div>
          <div v-for="v in solution.b.variables">
            {{ v }}={{ solution.b.result[v].toFixed(2) }}
          </div>
          <div>probabilities</div>
          <div v-for="(p, i) in solution.b.probabilities">{{ i }}={{ p.toFixed(2) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data: function () {
    return {
      rows: 3,
      cols: 3,
      matrix: new Array(),
      rowsTotals: new Array(),
      colsTotals: new Array(),
      solution: { bottomPrice: 0, topPrice: 0 },
      solved: false,
      brownRobbinsTable: new Array(),
    };
  },
  mounted: function () {
    this.buildMatrix();
  },
  methods: {
    //побудова матриць
    buildMatrix: function () {
      this.rowsTotals = [];
      this.colsTotals = [];
      this.matrix = [];
      this.matrix[0] = [3, 6, 8];
      this.matrix[1] = [9, 4, 2];
      this.matrix[2] = [7, 5, 4];
    },

    isNumber: function (event) {
      let value = event.target.value;
      let isValid = +value == +value;

      if (!isValid) {
        var resetEvent = document.createEvent("Event");
        resetEvent.initEvent("input", true, true);
        event.target.value = event.target._value;
        event.target.dispatchEvent(resetEvent);
      }
    },
    findMinMax: function () {
      for (var i = 0; i < this.rows; i++) {
        let min = this.matrix[i][0];
        for (var j = 0; j < this.cols; j++) {
          if (this.matrix[i][j] < min) min = this.matrix[i][j];
        }
        this.rowsTotals[i] = min;
      }

      for (var i = 0; i < this.cols; i++) {
        let max = this.matrix[0][i];
        for (var j = 0; j < this.rows; j++) {
          if (this.matrix[j][i] > max) max = this.matrix[j][i];
        }
        this.colsTotals[i] = max;
      }

      this.solution.bottomPrice = this.rowsTotals[0];
      for (var i = 0; i < this.cols; i++) {
        if (this.rowsTotals[i] > this.solution.bottomPrice)
          this.solution.bottomPrice = this.rowsTotals[i];
      }

      this.solution.topPrice = this.colsTotals[0];
      for (var i = 0; i < this.rows; i++) {
        if (this.colsTotals[i] < this.solution.topPrice)
          this.solution.topPrice = this.colsTotals[i];
      }
    },
    solve: function () {
      this.findMinMax();
      var constraints = [];
      var variables = new Array(this.rows);
      for (var i = 0; i < this.rows; i++) {
        variables[i] = "x" + (i + 1);
        constraints.push(`${variables[i]}>=0`);
      }
      this.solution.a = {
        f: "Minimize v = " + variables.join(" + "),
        constraints,
        variables,
      };

      constraints = [];
      variables = new Array(this.cols);
      for (var i = 0; i < this.cols; i++) {
        variables[i] = "y" + (i + 1);
        constraints.push(`${variables[i]}>=0`);
      }

      this.solution.b = {
        f: "Maximize v = " + variables.join(" + "),
        constraints,
        variables,
      };

      for (var c = 0; c < this.cols; c++) {
        var a = new Array(this.rows);
        for (var r = 0; r < this.rows; r++) {
          a[r] = this.matrix[r][c] + "x" + (r + 1);
        }
        var line = a.join(" + ") + " >= 1";
        this.solution.a.constraints.push(line);
      }

      for (var r = 0; r < this.rows; r++) {
        var a = new Array(this.cols);
        for (var c = 0; c < this.cols; c++) {
          a[c] = this.matrix[r][c] + "y" + (c + 1);
        }
        var line = a.join(" + ") + " <= 1";
        this.solution.b.constraints.push(line);
      }

      var simplex = require("simplex-solver");

      this.solution.a.result = simplex.maximize(
        this.solution.a.variables.map((x) => (x = "-" + x)).join(" + "),
        this.solution.a.constraints
      );
      this.solution.b.result = simplex.maximize(
        this.solution.b.variables.join(" + "),
        this.solution.b.constraints
      );

      this.solution.gamePrice = 1 / this.solution.b.result.max;
      this.solution.a.probabilities = {};
      this.solution.b.probabilities = {};

      for (var v = 0; v < this.solution.a.variables.length; v++) {
        var varName = this.solution.a.variables[v];
        this.solution.a.probabilities["p" + v] =
          this.solution.gamePrice * this.solution.a.result[varName];
      }

      for (var v = 0; v < this.solution.b.variables.length; v++) {
        var varName = this.solution.b.variables[v];
        this.solution.b.probabilities["p" + v] =
        this.solution.gamePrice * this.solution.b.result[varName];
      }
      console.log(this.solution);
      this.solved = true;
    },
    brownRobbins: function () {
      //var i = Math.floor(Math.random() * this.matrix.length);
      var i = 0;

      for (k = 1; k < 20; k++) {
        var min = this.matrix[i][0];

        var c = 0;
        var j = c;

        for (c = 0; c < this.matrix[i].length; c++) {
          if (this.matrix[i][c] < min) {
            min = this.matrix[i][c];
            j = c;
          }
        }

        var max = this.matrix[0][j];
        for (r = 0; r < this.matrix.length; r++) {
          if (this.matrix[r][j] > max) {
            max = this.matrix[r][j];
            i = r;
          }
        }

        vAvg = (min + max) / 2;

        this.brownRobbinsTable.push({
          k,
          i,
          j,
          min,
          max,
          vAvg,
        });
      }
      console.log(this.brownRobbinsTable);
    },
  },
};
</script>
