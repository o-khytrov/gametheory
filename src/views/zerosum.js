export default {
    data: function () {
      return {
        activeItem: "antagonist", // закладка
        matrix: new Array(),
        rowsTotals: new Array(),
        colsTotals: new Array(),
        rows: 3,
        cols: 3,
        bottomPrice: 0,
        topPrice: 0,
        modelx: "",
        modely: "",
  
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
  
        this.bottomPrice = this.rowsTotals[0];
        for (var i = 0; i < this.cols; i++) {
          if (this.rowsTotals[i] > this.bottomPrice)
            this.bottomPrice = this.rowsTotals[i];
        }
  
        this.topPrice = this.colsTotals[0];
        for (var i = 0; i < this.rows; i++) {
          if (this.colsTotals[i] < this.topPrice)
            this.topPrice = this.colsTotals[i];
        }
      },
      solve: function () {
        this.findMinMax();
  
        var a = new Array(this.rows);
        for (var i = 0; i < this.rows; i++) {
          a[i] = "x" + (i + 1);
        }
        this.modelx = "Minimize v = " + a.join(" + ") + " subject to";
  
        var constraints = [];
        for (var c = 0; c < this.cols; c++) {
          a = new Array(this.rows);
          for (var r = 0; r < this.rows; r++) {
            a[r] = this.matrix[r][c] + "x" + (r + 1);
          }
          var line = a.join(" + ") + " >= 1";
          constraints.push(line);
          this.modelx = this.modelx + "\n" + line;
        }
  
        for (var r = 0; r < this.rows; r++) {
          a = new Array(this.cols);
          for (var c = 0; c < this.cols; c++) {
            a[c] = this.matrix[r][c] + "y" + (c + 1);
          }
          var line = a.join(" + ") + " <= 1";
          //  constraints.push(line);
          this.modely = this.modely + "\n" + line;
        }
        console.log(this.modely);
        //this.brownRobbins();
        constraints.push("x1 >= 0");
        constraints.push("x2 >= 0");
        constraints.push("x3 >= 0");
  
        console.log(constraints);
        var simplex = require("simplex-solver");
  
        var result = simplex.maximize("-x1 + -x2 + -x3", constraints);
        var gamePrice = 1 / result.max;
        console.log(gamePrice);
        var p1 = gamePrice * result.x1;
        var p2 = gamePrice * result.x2;
        var p3 = gamePrice * result.x3;
        console.log(result);
        console.log({ p1, p2, p3 });
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