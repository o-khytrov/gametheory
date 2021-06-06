<template>
  <div id="bimatrix" class="container">
    <h3>Bimatrix game</h3>
    <table class="table table-hover table-bordered bimatrix-table">
      <thead class="">
        <tr>
          <td></td>
          <th
            style="text-align: center"
            class="colmax"
            v-for="(col, c) in bimatrix[0]"
          >
            B<sub>{{ c }}</sub>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, r) in bimatrix">
          <th style="color: green" class="">
            A<sub>{{ r }}</sub>
          </th>
          <td v-for="(cell, c) in row">
            <input
              v-model="bimatrix[r][c].a"
              type="number"
              style="float: left; margin: auto"
              v-bind:class="[
                columMaximums[c] && bimatrix[r][c].a == columMaximums[c].a
                  ? 'rowmax'
                  : '',
              ]"
            />
            <input
              v-model="bimatrix[r][c].b"
              type="number"
              v-bind:class="[
                rowMaximums[r] && bimatrix[r][c].b == rowMaximums[r].b
                  ? 'colmax'
                  : '',
              ]"
            />
            <div v-if="bimatrix[r][c].isnash">Nash Equilibrium</div>
            <div v-if="bimatrix[r][c].ispareto">Pareto Equilibrium</div>
            <div v-if="bimatrix[r][c].isstackelberg">
              Stackelberg Equilibrium
            </div>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr></tr>
      </tfoot>
    </table>
    <div v-if="Stackelberg.a">
      <div>Stackelberg competiion</div>
      <div v-if="Stackelberg.a" class="mt-3"></div>
      <div style="white-space: pre-wrap">{{ Stackelberg.a.text }}</div>
    </div>
    <div v-if="Stackelberg.b" class="mt-3">
      <div style="white-space: pre-wrap">{{ Stackelberg.b.text }}</div>
    </div>
    <button class="btn btn-primary mt-3" v-on:click="solveBimatrix">
      Solve
    </button>
  </div>
</template>
<script>
export default {
  data: function () {
    return {
      Stackelberg: {},
      bimatrix: new Array(),
    };
  },
  mounted: function () {
    this.bimatrix = [];
    this.bimatrix[0] = [
      {
        a: 5,
        b: 8,
      },
      {
        a: 6,
        b: 1,
      },
      {
        a: 3,
        b: 2,
      },
    ];
    this.bimatrix[1] = [
      {
        a: 2,
        b: 2,
      },
      {
        a: 4,
        b: 5,
      },
      {
        a: 6,
        b: 3,
      },
    ];
    this.bimatrix[2] = [
      {
        a: 4,
        b: 2,
      },
      {
        a: 3,
        b: 3,
      },
      {
        a: 6,
        b: 4,
      },
    ];
    //максимуми по рядкам
    this.rowMaximums = [];
    //максимуми по стовчикам
    this.columMaximums = [];
  },
  methods: {
    solveBimatrix: function () {
      //максимуми по рядкам матриці
      this.rowMaximums = [];
      //максимуми по стовпчикам матриці
      this.columMaximums = [];
      //об'єкт для результатів розрахунку рівноваги Штакельберга
      this.Stackelberg = {};

      //визначення максимумів по рядкам і стовчикам
      for (var r = 0; r < this.bimatrix.length; r++) {
        for (var c = 0; c < this.bimatrix[r].length; c++) {
          var s = this.bimatrix[r][c];
          var a = s.a;
          var b = s.b;

          if (!this.rowMaximums[r])
            this.rowMaximums[r] = {
              a,
              b,
            };
          if (!this.columMaximums[c])
            this.columMaximums[c] = {
              a,
              b,
            };

          if (a > this.rowMaximums[r].a) this.rowMaximums[r].a = a;
          if (b > this.rowMaximums[r].b) this.rowMaximums[r].b = b;
          if (a > this.columMaximums[c].a) this.columMaximums[c].a = a;
          if (b > this.columMaximums[c].b) this.columMaximums[c].b = b;
        }
      }

      for (var r = 0; r < this.bimatrix.length; r++) {
        for (var c = 0; c < this.bimatrix[r].length; c++) {
          var s = this.bimatrix[r][c];
          var a = s.a;
          var b = s.b;

          //якщо виграш першого гравця є максимум по стовчику і виграш другого гравця є максимум по рядку - це рівновага Неша
          if (a == this.columMaximums[c].a && b == this.rowMaximums[r].b) {
            this.bimatrix[r][c].isnash = true;
          }

          //пошук рівноваги Парето
          //перебір альтернативних стратегій з більшим виграшем
          var alt = [];
          for (var i = 0; i < this.bimatrix.length; i++) {
            for (var j = 0; j < this.bimatrix.length; j++) {
              if (this.bimatrix[i][j].a > a || this.bimatrix[i][j].b > b) {
                alt.push(this.bimatrix[i][j]);
              }
            }
          }

          var altA = alt.find((x) => x.a > a && x.b >= b);
          var altB = alt.find((x) => x.b > b && x.a >= a);
          //якщо альтернативні стратегії з кращим виграшем відсутні для всіх гравців ситуація є рівновагою Парето
          this.bimatrix[r][c].ispareto = !altB && !altA;
        }
      }

      //Пошук рівноваги Штакельберга
      
      //Рішення для ситуації, коли гравець В - лідер
      this.Stackelberg.b = {
        text: "If player B is a leader",
      };
      //Пояснення ходу
      var explanation = [];
      //Можливі ходи
      var options = [];
      
      //Перебір всіх відповідей гравця А
      for (var c = 0; c < this.bimatrix[0].length; c++) {
        var maxA = this.bimatrix[0][c].a;
        var playerAstr = 0;

        for (var r = 0; r < this.bimatrix.length; r++) {
          if (this.bimatrix[r][c].a > maxA) {
            maxA = this.bimatrix[r][c].a;
            playerAstr = r;
          }
        }
        //заповнюємо набір стратегій
        options.push({
          playerBstr: c,
          playerAstr,
        });
        //формуємо коментар
        explanation.push(
          `when player B is using strategy B${c}, player A chooses strategy A${playerAstr} A${playerAstr}:B${c} (${this.bimatrix[playerAstr][c].a}:${this.bimatrix[playerAstr][c].b})`
        );
      }

      var maxB = this.bimatrix[options[0].playerAstr][options[0].playerBstr].b;
      var stackelbergEq = {
        a: options[0].playerAstr,
        b: options[0].playerBstr,
      };
      for (var c = 0; c < options.length; c++) {
        if (
          this.bimatrix[options[c].playerAstr][options[c].playerBstr].b > maxB
        ) {
          maxB = this.bimatrix[options[c].playerAstr][options[c].playerBstr].b;
          stackelbergEq.a = options[c].playerAstr;
          stackelbergEq.b = options[c].playerBstr;
        }
      }
      console.log({
        boptions: options,
      });

      this.bimatrix[stackelbergEq.a][stackelbergEq.b].isstackelberg = true;
      explanation.push(
        `Maximum win of player B is ${maxB} in strategy  A${stackelbergEq.a}:B${stackelbergEq.b}`
      );
      this.Stackelberg.b.text += "\n" + explanation.join("\n");

      this.Stackelberg.a = {
        text: "If player A is a leader",
      };

      //Рішення для ситуації, коли гравець А - лідер
      explanation = [];
      options = [];
        //Перебір всіх відповідей гравця В
      for (var r = 0; r < this.bimatrix.length; r++) {
        var maxB = this.bimatrix[r][0].b;
        var playerBstr = 0;

        for (var c = 0; c < this.bimatrix[r].length; c++) {
          if (this.bimatrix[r][c].b > maxB) {
            maxB = this.bimatrix[r][c].b;
            playerBstr = c;
          }
        }
        //заповнюємо набір стратегій
        options.push({
          playerBstr,
          playerAstr: r,
        });
         //формуємо коментар
        explanation.push(
          `when player A is using strategy A${r}, player B chooses strategy B${playerBstr} A${r}:B${playerBstr} (${this.bimatrix[r][playerBstr].a}:${this.bimatrix[r][playerBstr].b})`
        );
      }
      //знаходимо максимум
      var maxA = this.bimatrix[options[0].playerAstr][options[0].playerBstr].a;
      var stackelbergEq = {
        a: options[0].playerAstr,
        b: options[0].playerBstr,
      };
      for (var c = 0; c < options.length; c++) {
        if (
          this.bimatrix[options[c].playerAstr][options[c].playerBstr].a > maxA
        ) {
          maxA = this.bimatrix[options[c].playerAstr][options[c].playerBstr].a;
          stackelbergEq.a = options[c].playerAstr;
          stackelbergEq.b = options[c].playerBstr;
        }
      }
      this.bimatrix[stackelbergEq.a][stackelbergEq.b].isstackelberg = true;
      explanation.push(
        `Maximum win of player A is ${maxA} in strategy  A${stackelbergEq.a}:B${stackelbergEq.b}`
      );
      this.Stackelberg.a.text += "\n" + explanation.join("\n");

 
      this.$forceUpdate();
    },
  },
};
</script>
