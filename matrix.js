(function () {
  'use strict';

  var Vector = require('./vector');

  /**
   * @method constructor
   * @desc Creates a `Matrix` from the supplied arguments.
   **/
  function Matrix (data, options) {
    this.type = Matrix.defaultType;
    if (options && options.type)
      this.type = options.type;
    this.shape = [];

    if (data && data.buffer && data.buffer instanceof ArrayBuffer) {
      //assign
      return Matrix.fromTypedArray(data, options.shape);
    } else if (data instanceof Array) {
      //convert to typed array
      return Matrix.fromArray(data, this.type);
    } else if (data instanceof Vector) {
      //copy
      this.shape = options && options.shape ? options.shape : [data.length, 1];
      this.data = new data.type(data.data);
      this.type = data.type;
    } else if (data instanceof Matrix) {
      //copy
      this.shape = [data.shape[0], data.shape[1]];
      this.data = new data.type(data.data);
      this.type = data.type;
    } else if(!data && options && options.shape) {
      //create empty
      this.shape = options.shape;
      this.data = new this.type(options.shape[0] * options.shape[1]);
    }
  }

  /**
   * Default type for data
   **/
  Matrix.defaultType = Float64Array;

  /**
   *
   **/
  Matrix.fromTypedArray = function (data, shape) {
    if (shape[0] * shape[1] != data.length)
      throw new Error("Matrix shape != array dimensions.");

    var self = Object.create(Matrix.prototype);
    self.shape = shape;
    self.data = data;
    self.type = data.constructor;

    return self;
  };

  /**
   *
   **/
  Matrix.fromArray = function (array, type) {
    type = type || Matrix.defaultType;
    var r = array.length, // number of rows
        c = array[0].length,  // number of columns
        data = new type(r * c);

    var i, j;
    for (i = 0; i < r; ++i)
      for (j = 0; j < c; ++j)
        data[i * c + j] = array[i][j];

    return Matrix.fromTypedArray(data, [r, c]);
  };

  /**
   * Static method. Adds two matrices `a` and `b` together.
   * @param {Matrix} a
   * @param {Matrix} b
   * @returns {Matrix} a new matrix containing the sum of `a` and `b`
   **/
  Matrix.add = function (a, b) {
    return new Matrix(a).add(b);
  };

  /**
   * Adds `matrix` to current matrix.
   * @param {Matrix} a
   * @param {Matrix} b
   * @returns {Matrix} `this`
   **/
  Matrix.prototype.add = function (matrix) {
    var r = this.shape[0],          // rows in this matrix
        c = this.shape[1],          // columns in this matrix
        d1 = this.data,
        d2 = matrix.data;

    if (r !== matrix.shape[0] || c !== matrix.shape[1])
      throw new Error('sizes do not match!');

    var i, size = r * c;
    for (i = 0; i < size; i++)
      d1[i] += d2[i];

    return this;
  };

  /**
   * Static method. Subtracts the matrix `b` from matrix `a`.
   * @param {Matrix} a
   * @param {Matrix} b
   * @returns {Matrix} a new matrix containing the difference between `a` and `b`
   **/
  Matrix.subtract = function (a, b) {
    return new Matrix(a).subtract(b);
  };

  /**
   * Subtracts `matrix` from current matrix.
   * @param {Matrix} a
   * @param {Matrix} b
   * @returns {Matrix} `this`
   **/
  Matrix.prototype.subtract = function (matrix) {
      var r = this.shape[0],          // rows in this matrix
          c = this.shape[1],          // columns in this matrix
          d1 = this.data,
          d2 = matrix.data;

      if (r !== matrix.shape[0] || c !== matrix.shape[1])
        throw new Error('sizes do not match');

      var i, size = r * c;
      for (i = 0; i < size; i++)
        d1[i] -= d2[i];

      return this;
  };

  /**
   * Static method. Multiplies all elements of a matrix `a` with a specified `scalar`.
   * @param {Matrix} a
   * @param {Number} scalar
   * @returns {Matrix} a new scaled matrix
   **/
  Matrix.scale = function (a, scalar) {
    return new Matrix(a).scale(scalar);
  };

  /**
   * Multiplies all elements of current matrix with a specified `scalar`.
   * @param {Number} scalar
   * @returns {Matrix} `this`
   **/
  Matrix.prototype.scale = function (scalar) {
    var r = this.shape[0],          // rows in this matrix
        c = this.shape[1],          // columns in this matrix
        d1 = this.data,
        i, 
        size = r * c;

    for (i = 0; i < size; i++)
      d1[i] *= scalar;

    return this;
  };

  /**
   * Static method. Hadamard product of matrices
   * @param {Matrix} a
   * @param {Matrix} b
   * @returns {Matrix} a new matrix containing the hadamard product
   **/
  Matrix.product = function (a, b) {
    return new Matrix(a).product(b);
  };

  /**
   * Hadamard product of matrices
   * @param {Matrix} a
   * @param {Matrix} b
   * @returns {Matrix} `this`
   **/
  Matrix.prototype.product = function (matrix) {
    if (this.shape[0] !== matrix.shape[0] || this.shape[1] !== matrix.shape[1])
      return new Error('invalid size');

    var r = this.shape[0],          // rows in this matrix
        c = this.shape[1],          // columns in this matrix
        d1 = this.data,
        d2 = matrix.data,
        i, 
        size = r * c;

    for (i = 0; i < size; i++)
      d1[i] *= d2[i];

    return this;
  };

  /**
   * Static method. Creates an `i x j` matrix containing zeros (`0`), takes an
   * optional `type` argument which should be an instance of `TypedArray`.
   * @param {Number} i
   * @param {Number} j
   * @param {TypedArray} type
   * @returns {Matrix} a matrix of the specified dimensions and `type`
   **/
  Matrix.zeros = function (i, j, type) {
    if (!(i > 0 && j > 0))
      throw new Error('invalid size');

    type = type || Matrix.defaultType;

    var data = new type(i * j);
    var m = Matrix.fromTypedArray(data, [i, j]);
    m.zeros();
    return m;
  };

  /**
   * Fills matrix with 0
   */
  Matrix.prototype.zeros = function() {
    var r = this.shape[0],
        c = this.shape[1],
        data = this.data,
        k,
        size = r * c;
    for (k = 0; k < size; k++)
      data[k] = +0.0;
    return this;
  };

  /**
   * Static method. Creates an `i x j` matrix containing ones (`1`), takes an
   * optional `type` argument which should be an instance of `TypedArray`.
   * @param {Number} i
   * @param {Number} j
   * @param {TypedArray} type
   * @returns {Matrix} a matrix of the specified dimensions and `type`
   **/
  Matrix.ones = function (i, j, type) {
    if (!(i > 0 && j > 0))
      throw new Error('invalid size');

    type = type || Matrix.defaultType;

    var data = new type(i * j);
    var m = Matrix.fromTypedArray(data, [i, j]);
    m.ones();
    return m;
  };

  /**
   * Fills matrix with 1
   */
  Matrix.prototype.ones = function() {
    var r = this.shape[0],
        c = this.shape[1],
        data = this.data,
        k,
        size = r * c;
    for (k = 0; k < size; k++)
      data[k] = +1.0;
    return this;
  };

  /**
   * Static method. Creates an `i x j` identity matrix, takes an
   * optional `type` argument which should be an instance of `TypedArray`.
   * Alias for identity()
   * @param {Number} r
   * @param {Number} c
   * @param {TypedArray} type
   * @returns {Matrix} a matrix of the specified dimensions and `type`
   **/
  Matrix.eye = function (r, c, type) {
    if (c === undefined)
      c = r;
    if (!(r > 0 && c > 0))
      throw new Error('invalid size');

    type = type || Matrix.defaultType;

    var data = new type(r * c);
    var m = Matrix.fromTypedArray(data, [r, c]);
    m.eye();
    return m;
  };

  /**
   * Fills matrix with 1 by diagonal, other with 0 (identity matrix)
   */
  Matrix.prototype.eye = function() {
    return this.diagonal(1.);
  };

  /**
   * Static method. Creates an `i x j` diagonal matrix with diagonal values `val`.
   * Takes an optional `type` argument which should be an instance of `TypedArray`.
   * @param {Number} r
   * @param {Number} c
   * @param {Number} val, non-0 diagonal values
   * @param {TypedArray} type
   * @returns {Matrix} a matrix of the specified dimensions and `type`
   **/
  Matrix.diagonal = function (r, c, val, type) {
    if (c === undefined)
      c = r;
    if (!(r > 0 && c > 0))
      throw new Error('invalid size');
    if (val === undefined)
      val = 1.;

    type = type || Matrix.defaultType;

    var data = new type(r * c);
    var m = Matrix.fromTypedArray(data, [r, c]);
    m.diagonal(val);
    return m;
  };

  /**
   * Fills matrix with `val` by diagonal, other with 0 (diagonal matrix)
   */
  Matrix.prototype.diagonal = function(val) {
    if (val === undefined)
      val = 1.;
    var r = this.shape[0],
        c = this.shape[1],
        data = this.data,
        i, j,
        size = r * c;
    for (i = 0; i < r; i++)
      for (j = 0; j < c; j++)
        data[i * c + j] = i == j ? val : +0.0;
    return this;
  };

  /**
   * Static method. Creates an `i x j` matrix containing random values
   * according to a normal distribution, takes an optional `type` argument
   * which should be an instance of `TypedArray`.
   * @param {Number} i
   * @param {Number} j
   * @param {Number} deviation (default 1)
   * @param {Number} mean (default 0)
   * @param {TypedArray} type
   * @returns {Matrix} a matrix of the specified dimensions and `type`
   **/
  Matrix.random = function (i, j, deviation, mean, type) {
    deviation = deviation || 1;
    mean = mean || 0;
    type = type || Matrix.defaultType;
    var data = new type(i * j),
        k,
        size = i * j;

    for (k = 0; k < size; k++)
      data[k] = deviation * Math.random() + mean;

    return Matrix.fromTypedArray(data, [i, j]);
  };

  /**
   * Static method. Creates an `i x j` matrix containing random values
   * according to a normal (Gaussian) distribution, takes an optional `type` argument
   * which should be an instance of `TypedArray`.
   * @param {Number} i
   * @param {Number} j
   * @param {Number} deviation (default 1)
   * @param {Number} mean (default 0)
   * @param {TypedArray} type
   * @returns {Matrix} a matrix of the specified dimensions and `type`
   **/
  Matrix.randomNormal = function (i, j, deviation, mean, type) {
    type = type || Matrix.defaultType;
    var data = new type(i * j);
    var m = Matrix.fromTypedArray(data, [i, j]);
    m.randomNormal(deviation, mean);
    return m;
  };

  /**
   * Fills matrix with random values according to a normal (Gaussian) distribution
   * https://en.wikipedia.org/wiki/Normal_distribution
   * @param {Number} deviation (default 1)
   * @param {Number} mean (default 0)
   **/
  Matrix.prototype.randomNormal = function(deviation, mean) {
    this._randomNormal1(deviation, mean);
    //this._randomNormal2(deviation, mean);
    return this;
  }

  //Uses Box–Muller method
  //https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
  Matrix.prototype._randomNormal1 = function(deviation, mean) {
    deviation = deviation || 1.0;
    mean = mean || 0.0;
    var size = this.shape[0] * this.shape[1];
    var data = this.data;
    var k = 0;
    var u1, u2, 
      a, b0, b1, z0, z1;

    do {
      do {
        u1 = Math.random();
      } while ( u1 <= Number.EPSILON );
      u2 = Math.random();
      a = Math.sqrt( -2.0 * Math.log( u1 ) );
      b0 = Math.cos( 2.0 * Math.PI * u2 );
      b1 = Math.sin( 2.0 * Math.PI * u2 );
      z0 = (a * b0) * deviation + mean;
      z1 = (a * b1) * deviation + mean;
      data[k] = z0;
      k++;
      if (k < size) {
        data[k] = z1;
        k++;
      }
    } while(k < size);
  };

  //Uses Marsaglia polar method
  //https://en.wikipedia.org/wiki/Marsaglia_polar_method
  Matrix._randomNormal2 = function(deviation, mean) {
    deviation = deviation || 1.0;
    mean = mean || 0.0;
    var size = this.shape[0] * this.shape[1];
    var data = this.data;
    var k = 0;
    var u, v, s, 
      mul, spare, z0, z1;

    do {
      do {
        u = Math.random() * 2 - 1;
        v = Math.random() * 2 - 1;
              s = u * u + v * v;
      } while ( s >= 1 || s == 0 );
      mul = Math.sqrt( -2.0 * Math.log(s) / s );
      spare = v * mul;
      z0 = mean + deviation * u * mul;
      z1 = mean + deviation * spare;
      data[k] = z0;
      k++;
      if (k < size) {
        data[k] = z1;
        k++;
      }
    } while(k < size);
  };

  /**
   * Static method. Multiplies two matrices `a` and `b` of matching dimensions.
   * @param {Matrix} a, size m x n
   * @param {Matrix} b, size n x k
   * @param {Matrix} c optional, matrix with size m x k to hold result of product of `a` and `b`
   *    If not present, will be created
   * @returns {Matrix} a new resultant matrix with size m x k containing the matrix product of `a` and `b`
   **/
  Matrix.multiply = function (a, b, c) {
    return a.multiply(b, c);
  };

  /**
   * Multiplies two matrices `a` and `b` of matching dimensions.
   * this - matrix of size m x n
   * @param {Matrix} matrix of size n x k
   * @param {Matrix} res optional, matrix with size m x k to hold result of product of `a` and `b`
   *    If not present, will be created
   * @returns {Matrix} resultant matrix with size m x k containing the matrix product of `a` and `b`
   **/
  Matrix.prototype.multiply = function (matrix, res) {
    var r1 = this.shape[0],   // rows in this matrix
        c1 = this.shape[1],   // columns in this matrix
        r2 = matrix.shape[0], // rows in multiplicand
        c2 = matrix.shape[1], // columns in multiplicand
        d1 = this.data,
        d2 = matrix.data;

    if (c1 !== r2)
      throw new Error('sizes do not match');

    if (res === undefined)
      res = Matrix.fromTypedArray(new this.type(r1 * c2), [r1, c2]);
    var i, j, k,
        sum;
    for (i = 0; i < r1; i++) {
      for (j = 0; j < c2; j++) {
        sum = +0;
        for (k = 0; k < c1; k++)
          sum += d1[i * c1 + k] * d2[j + k * c2];

        res.data[i * c2 + j] = sum;
      }
    }

    return res;
  };

  /**
   * Transposes a matrix (mirror across the diagonal).
   * @returns {Matrix} `this`
   **/

  Object.defineProperty(Matrix.prototype, 'T', {
    get: function() { return this.transpose(); }
  });

  Matrix.prototype.transpose = function () {
    var r = this.shape[0],
        c = this.shape[1],
        i, j;

    var data = new this.type(c * r);
    for (i = 0; i < r; i++)
      for (j = 0; j < c; j++)
        data[j * r + i] = this.data[i * c + j];

    return Matrix.fromTypedArray(data, [c, r]);
  };

  Matrix.prototype.transposed = function () {
    var r = this.shape[0],
        c = this.shape[1],
        i, j;

    var data = new this.type(c * r);
    for (i = 0; i < r; i++)
      for (j = 0; j < c; j++)
        data[j * r + i] = this.data[i * c + j];
    this.data = data;
    this.shape = [c, r];

    return this;
  };

  /**
   * Determines the inverse of any invertible square matrix using
   * Gaussian elimination.
   * @returns {Matrix} the inverse of the matrix
   **/
  Matrix.prototype.inverse = function () {
    var l = this.shape[0],
        m = this.shape[1];

    if (l !== m)
      throw new Error('invalid dimensions');

    var identity = Matrix.identity(l);
    var augmented = Matrix.augment(this, identity);
    var gauss = augmented.gauss();

    var left = Matrix.zeros(l, m),
        right = Matrix.zeros(l, m),
        n = gauss.shape[1],
        i, j;
    for (i = 0; i < l; i++) {
      for (j = 0; j < n; j++) {
        if (j < m)
          left.set(i, j, gauss.get(i, j));
        else
          right.set(i, j - l, gauss.get(i, j));
      }
    }

    if (!left.equals(Matrix.identity(l)))
      throw new Error('matrix is not invertible');

    return right;
  };

  /**
   * Performs Gaussian elimination on a matrix.
   * @returns {Matrix} the matrix in reduced row echelon form
   **/
  Matrix.prototype.gauss = function () {
    var l = this.shape[0],
        m = this.shape[1];

    var copy = new Matrix(this),
        lead = 0,
        pivot,
        i, j, k,
        leadValue;

    for (i = 0; i < l; i++) {
      if (m <= lead)
        return new Error('matrix is singular');

      j = i;
      while (copy.data[j * m + lead] === 0) {
        j++;
        if (l === j) {
          j = i;
          lead++;

          if (m === lead)
            return new Error('matrix is singular');
        }
      }

      copy.swap(i, j);

      pivot = copy.data[i * m + lead];
      if (pivot !== 0) {
        // scale down the row by value of pivot
        for (k = 0; k < m; k++)
          copy.data[(i * m) + k] = copy.data[(i * m) + k] / pivot;
      }


      for (j = 0; j < l; j++) {
        leadValue = copy.data[j * m + lead];
        if (j !== i)
          for (k = 0; k < m; k++)
            copy.data[j * m + k] = copy.data[j * m + k] - (copy.data[i * m + k] * leadValue);
      }

      lead++;
    }

    for (i = 0; i < l; i++) {
      pivot = 0;
      for (j = 0; j < m; j++)
        if (!pivot)
          pivot = copy.data[i * m + j];

      if (pivot)
        // scale down the row by value of pivot
        for (k = 0; k < m; k++)
          copy.data[(i * m) + k] = copy.data[(i * m) + k] / pivot;
    }

    return copy;
  };

  /**
   * Performs full LU decomposition on a matrix.
   * @returns {Array} a triple (3-tuple) of the lower triangular resultant matrix `L`, the upper
   * triangular resultant matrix `U` and the pivot array `ipiv`
   **/
  Matrix.prototype.lu = function () {
    var r = this.shape[0],
        c = this.shape[1],
        plu = Matrix.plu(this),
        ipiv = plu[1],
        pivot = Matrix.identity(r),
        lower = new Matrix(plu[0]),
        upper = new Matrix(plu[0]),
        i, j;

    for (i = 0; i < r; i++)
      for (j = i; j < c; j++)
        lower.data[i * c + j] = i === j ? 1 : 0;

    for (i = 0; i < r; i++)
      for (j = 0; j < i && j < c; j++)
        upper.data[i * c + j] = 0;

    return [lower, upper, ipiv];
  };

  /**
   * Static method. Performs LU factorization on current matrix.
   * @returns {Array} an array with a new instance of the current matrix LU-
   * factorized and the corresponding pivot Int32Array
   **/
  Matrix.plu = function(matrix) {
    return new Matrix(matrix).plu();
  };

  /**
   * Performs LU factorization on current matrix.
   * @returns {Array} an array with the current matrix LU-factorized and the
   * corresponding pivot Int32Array
   **/
  Matrix.prototype.plu = function () {
    var data = this.data,
        n = this.shape[0],
        ipiv = new Int32Array(n),
        max, abs, diag, p,
        i, j, k;

    for (k = 0; k < n; ++k) {
      p = k;
      max = Math.abs(data[k * n + k]);
      for (j = k + 1; j < n; ++j) {
        abs = Math.abs(data[j * n + k]);
        if (max < abs) {
          max = abs;
          p = j;
        }
      }

      ipiv[k] = p;

      if (p !== k)
        this.swap(k, p);

      diag = data[k * n + k];
      for (i = k + 1; i < n; ++i)
        data[i * n + k] /= diag;

      for (i = k + 1; i < n; ++i) {
        for (j = k + 1; j < n - 1; ++j) {
          data[i * n + j] -= data[i * n + k] * data[k * n + j];
          ++j;
          data[i * n + j] -= data[i * n + k] * data[k * n + j];
        }

        if(j === n - 1)
          data[i * n + j] -= data[i * n + k] * data[k * n + j];
      }
    }

    return [this, ipiv];
  };

  /**
   * Solves an LU factorized matrix with the supplied right hand side(s)
   * @param {Matrix} rhs, right hand side(s) to solve for
   * @param {Int32Array} array of pivoted row indices
   * @returns {Matrix} rhs replaced by the solution
   **/
  Matrix.prototype.lusolve = function (rhs, ipiv) {
    var lu = this.data,
        n = rhs.shape[0],
        nrhs = rhs.shape[1],
        x = rhs.data,
        i, j, k;

    // pivot right hand side
    for (i = 0; i < ipiv.length; i++)
      if (i !== ipiv[i])
        rhs.swap(i, ipiv[i]);

    for (k = 0; k < nrhs; k++) {
      // forward solve
      for (i = 0; i < n; i++)
        for (j = 0; j < i; j++)
          x[i * nrhs + k] -= lu[i * n + j] * x[j * nrhs + k];

      // backward solve
      for (i = n - 1; i >= 0; i--) {
        for (j = i + 1; j < n; j++)
          x[i * nrhs + k] -= lu[i * n + j] * x[j * nrhs + k];
        x[i * nrhs + k] /= lu[i * n + i];
      }
    }

    return rhs;
  };

  /**
   * Solves AX = B using LU factorization, where A is the current matrix and
   * B is a Vector/Matrix containing the right hand side(s) of the equation.
   * @param {Matrix/Vector} rhs, right hand side(s) to solve for
   * @returns {Matrix} a new matrix containing the solutions of the system
   **/
  Matrix.prototype.solve = function (rhs) {
    var plu = Matrix.plu(this),
        lu = plu[0],
        ipiv = plu[1];

    return lu.lusolve(new Matrix(rhs), ipiv);
  };

  /**
   * Solve A * X = B
   * A - square matrix, B - this matrix/vector, X - solution with same size as B
   * @param {Matrix} a, must be square and of full-rank
   * @param {Matrix/Vector} b
   * @param {Matrix/Vector} x solution; if passed, solution matrix/vector will be 
   *  written to it, else will be created
   * @param {bool} keepA if false, `a` will be LU-factorized, else `a` will be unmodified (requires more RAM)
   * @returns {Matrix/Vector} solution
   */
  Matrix.solveSquare = function (a, b, x, keepA) {
    var isBVector = (b instanceof Vector);
    if (keepA === undefined)
      keepA = true;
    var r1 = a.shape[0],
        c1 = a.shape[1];
    var r2 = isBVector ? b.length : b.shape[0],
        c2 = isBVector ? 1 : b.shape[1];
    if (c1 !== r2)
      throw new Error('shapes are not aligned');
    if (r1 != c1)
      throw new Error('input matrix should be square');
    if (x === undefined)
      x = isBVector ? new Vector(b) : new Matrix(b);

    var plu = keepA ? Matrix.plu(a) : a.plu(),
        lu = plu[0],
        ipiv = plu[1];
    var rhs;
    if (!isBVector)
      rhs = x;
    else
      rhs = new Matrix(x.data, {shape: [r2, c2]});
    lu.lusolve(rhs, ipiv);
    return x;
  };

  /**
   * Static method. Augments two matrices `a` and `b` of matching dimensions
   * (appends `b` to `a`).
   * @param {Matrix} a
   * @param {Matrix} b
   * @returns {Matrix} the resultant matrix of `b` augmented to `a`
   **/
  Matrix.augment = function (a, b) {
    return new Matrix(a).augment(b);
  };

  /**
   * Augments `matrix` with current matrix.
   * @param {Matrix} matrix
   * @returns {Matrix} `this`
   **/
  Matrix.prototype.augment = function (matrix) {
    if (matrix.shape.length === 0)
     return this;

    var r1 = this.shape[0],
        c1 = this.shape[1],
        r2 = matrix.shape[0],
        c2 = matrix.shape[1],
        d1 = this.data,
        d2 = matrix.data,
        i, j;

    if (r1 !== r2)
      throw new Error("Rows do not match.");

    var length = c1 + c2,
        data = new this.type(length * r1);

    for (i = 0; i < r1; i++)
      for (j = 0; j < c1; j++)
        data[i * length + j] = d1[i * c1 + j];

    for (i = 0; i < r2; i++)
      for (j = 0; j < c2; j++)
        data[i * length + j + c1] = d2[i * c2 + j];

    this.shape = [r1, length];
    this.data = data;

    return this;
  };

  /**
   * Static method. Creates an identity matrix of `size`, takes an optional `type` argument
   * which should be an instance of `TypedArray`.
   * @param {Number} size
   * @param {TypedArray} type
   * @returns {Matrix} an identity matrix of the specified `size` and `type`
   **/
  Matrix.identity = function (size, type) {
    if (size < 0)
      throw new Error('invalid size');

    type = type || Matrix.defaultType;
    var matrix = Matrix.zeros(size, size, type),
        i, j;
    for (i = 0; i < size; i++)
      matrix.data[i * size + i] = 1.0;

    return matrix;
  };

  /**
   * Static method. Creates a magic square matrix of `size`, takes an optional `type` argument
   * which should be an instance of `TypedArray`.
   * @param {Number} size
   * @param {Number} type
   * @returns {Matrix} a magic square matrix of the specified `size` and `type`
   **/
  Matrix.magic = function (size, type) {
    if (size < 0)
      throw new Error('invalid size');

    function f(n, x, y) {
      return (x + y * 2 + 1) % n;
    }

    type = type || Matrix.defaultType;
    var data = new type(size * size),
        i, j;
    for (i = 0; i < size; i++)
      for (j = 0; j < size; j++)
        data[(size - i - 1) * size + (size - j - 1)] =
          f(size, size - j - 1, i) * size + f(size, j, i) + 1;

    return Matrix.fromTypedArray(data, [size, size]);
  };

  /**
   * Gets the diagonal of a matrix.
   * @returns {Vector} the diagonal of the matrix as a vector
   **/
  Matrix.prototype.diag = function () {
    var r = this.shape[0],
        c = this.shape[1],
        data = new this.type(Math.min(r, c)),
        i;

    for (i = 0; i < r && i < c; i++)
      data[i] = this.data[i * c + i];

    return new Vector(data);
  };

  /**
   * Gets the determinant of any square matrix using LU factorization.
   * @returns {Number} the determinant of the matrix
   **/
  Matrix.prototype.determinant = function () {
    if (this.shape[0] !== this.shape[1])
      throw new Error('matrix is not square');

    var plu = Matrix.plu(this),
        ipiv = plu.pop(),
        lu = plu.pop(),
        r = this.shape[0],
        c = this.shape[1],
        product = 1,
        sign = 1,
        i;

    // get sign from ipiv
    for (i = 0; i < r; i++)
      if (i !== ipiv[i])
        sign *= -1;

    for (i = 0; i < r; i++)
      product *= lu.data[i * c + i];

    return sign * product;
  };

  /**
   * Gets the trace of the matrix (the sum of all diagonal elements).
   * @returns {Number} the trace of the matrix
   **/
  Matrix.prototype.trace = function () {
    var diagonal = this.diag(),
        result = 0,
        i, l;

    for (i = 0, l = diagonal.length; i < l; i++)
      result += diagonal.get(i);

    return result;
  };

  /**
   * Static method. Checks the equality of two matrices `a` and `b`.
   * @param {Matrix} a
   * @param {Matrix} b
   * @returns {Boolean} `true` if equal, `false` otherwise
   **/
  Matrix.equals = function (a, b) {
    return a.equals(b);
  };

  /**
   * Checks the equality of `matrix` and current matrix.
   * @param {Matrix} matrix
   * @returns {Boolean} `true` if equal, `false` otherwise
   **/
  Matrix.prototype.equals = function (matrix) {
    var r = this.shape[0],
        c = this.shape[1],
        d1 = this.data,
        d2 = matrix.data;

    if (r !== matrix.shape[0] || c !== matrix.shape[1] || this.type !== matrix.type)
      return false;

    var i, size = r * c;
    for (i = 0; i < size; i++)
      if (d1[i] !== d2[i])
        return false;

    return true;
  };

  /**
   * Gets the value of the element in row `i`, column `j` of current matrix
   * @param {Number} i
   * @param {Number} j
   * @returns {Number} the element at row `i`, column `j` of current matrix
   **/
  Matrix.prototype.get = function (i, j) {
    if (i < 0 || j < 0 || i > this.shape[0] - 1 || j > this.shape[1] - 1)
      throw new Error('index out of bounds');

    return this.data[i * this.shape[1] + j];
  };

  /**
   * Sets the element at row `i`, column `j` to value
   * @param {Number} i
   * @param {Number} j
   * @param {Number} value
   * @returns {Matrix} `this`
   **/
  Matrix.prototype.set = function (i, j, value) {
    if (i < 0 || j < 0 || i > this.shape[0] - 1 || j > this.shape[1] - 1)
      throw new Error('index out of bounds');

    this.data[i * this.shape[1] + j] = value;
    return this;
  };

  /**
   * Get row of matrix
   * @param {Number} r
   * @param {Bool} copy
   * @returns {Vector} row
   **/
  Matrix.prototype.row = function(r, copy) {
    if (copy === undefined)
      copy = true;
    var rows = this.shape[0],
        cols = this.shape[1];
    if(!( r >= 0 && r < rows ))
      throw new Error("Incorrect row");
    var size1 = this.data.byteLength / this.data.length;
    var data = new this.type(this.data.buffer, r * cols * size1, cols);
    if (copy)
      data = new this.type(data);
    var v = new Vector(data, {length: cols});
    return v;
  }

  /**
   * Get col of matrix
   * @param {Number} c
   * @returns {Vector} col
   **/
  Matrix.prototype.col = function(c) {
    var rows = this.shape[0],
        cols = this.shape[1];
    if(!( c >= 0 && c < cols ))
      throw new Error("Incorrect col");
    var size1 = this.data.byteLength / this.data.length;
    var data = new this.type(rows);
    for (var r = 0 ; r < rows ; r++)
      data[r] = this.data[r * cols + c];
    var v = new Vector(data, {length: rows});
    return v;
  }

  /**
   * Swaps two rows `i` and `j` in a matrix
   * @param {Number} i
   * @param {Number} j
   * @returns {Matrix} `this`
   **/
  Matrix.prototype.swap = function (i, j) {
    if (i < 0 || j < 0 || i > this.shape[0] - 1 || j > this.shape[0] - 1)
      throw new Error('index out of bounds');

    var c = this.shape[1];

    // copy first row
    var copy = this.data.slice(i * c, (i + 1) * c);
    // move second row into first row spot
    this.data.copyWithin(i * c, j * c, (j + 1) * c);
    // copy first row back into second row spot
    this.data.set(copy, j * c);

    return this;
  };

  /**
   * Maps a function `callback` to all elements of a copy of current matrix.
   * @param {Function} callback
   * @returns {Matrix} the resultant mapped matrix
   **/
  Matrix.prototype.map = function (callback) {
    var r = this.shape[0],
        c = this.shape[1],
        mapped = new Matrix(this),
        data = mapped.data,
        i, 
        size = r * c;

    for (i = 0; i < size; i++)
      data[i] = callback.call(mapped, data[i], i / c | 0, i % c, data);

    return mapped;
  };

  /**
   * Functional version of for-looping the elements in a matrix, is
   * equivalent to `Array.prototype.forEach`.
   * @param {Function} callback
   * @returns {Matrix} `this`
   **/
  Matrix.prototype.each = function (callback) {
    var r = this.shape[0],
        c = this.shape[1],
        i, 
        size = r * c;

    for (i = 0; i < size; i++)
      callback.call(this, this.data[i], i / c | 0, i % c);

    return this;
  };

  /**
   * Equivalent to `TypedArray.prototype.reduce`.
   * @param {Function} callback
   * @param {Number} initialValue
   * @returns {Number} result of reduction
   **/
  Matrix.prototype.reduce = function (callback, initialValue) {
    var r = this.shape[0],
        c = this.shape[1];

    if (r * c === 0 && !initialValue)
      throw new Error('Reduce of empty matrix with no initial value.');

    var i = 0,
        value = initialValue || this.data[i++], 
        size = r * c;

    for (; i < size; i++)
      value = callback.call(this, value, this.data[i], i / c | 0, i % c);
    return value;
  };

  /**
   * Finds the rank of the matrix using row echelon form
   * @returns {Number} rank
   **/
  Matrix.prototype.rank = function () {
    var vectors = this
      .toArray()
      .map(function(r) {
        return new Vector(r);
      });

    var r = this.shape[0],
        c = this.shape[1],
        counter = 0,
        i, j, tmp,
        pivot, target, scalar;

    for (i = 0; i < r - 1; i++) {
      // go through each row until the row before the last
      pivot = null;
      for (j = i; j < r; j++) {
        // find the pivot (first row where column of same index is non-zero)
        if (vectors[i].get(i)) {
          if (i !== j) {
            // if not the current row, swap the rows, bring pivot the current row index
            tmp = vectors[i];
            vectors[i] = vectors[j];
            vectors[j] = tmp;
          }
          pivot = vectors[i];
          break;
        }
      }
      // if pivot not found, continue
      if (!pivot)
        continue;

      // otherwise, for all rows underneath pivot, cancel all column index to zero
      for (j = (i + 1); j < r; j++) {
        target = vectors[j];
        scalar = target.get(i) / pivot.get(i);
        vectors[j] = target.subtract(pivot.scale(scalar));
      }
    }

    // now vectors should be in row echelon form!
    // use optimized loops to count number of vectors that have non-zero values
    for (i = 0; i < r; i++) {
      for (j = 0; j < c; j++) {
        if (vectors[i].get(j)) {
          counter++;
          break;
        }
      }
    }

    // should be rank
    return counter;
  };

  Matrix.rank = function (matrix) {
    return new Matrix(matrix).rank();
  };

  /**
   * Converts current matrix into a readable formatted string
   * @returns {String} a string of the matrix' contents
   **/
  Matrix.prototype.toString = function () {
    var result = [],
        r = this.shape[0],
        c = this.shape[1],
        i;

    for (i = 0; i < r; i++)
      // get string version of current row and store it
      result.push('[' + this.data.subarray(i * c, (i + 1) * c ).toString() + ']');

    return '[' + result.join(', \n') + ']';
  };

  /**
   * Converts current matrix into a two-dimensional array
   * @returns {Array} an array of the matrix' contents
   **/
  Matrix.prototype.toArray = function () {
    var result = [],
        r = this.shape[0],
        c = this.shape[1],
        i;

    for (i = 0; i < r; i++)
      // copy current row into a native array and store it
      result.push(Array.prototype.slice.call(this.data.subarray(i * c, (i + 1) * c)));

    return result;
  };

  module.exports = Matrix;
  try {
    window.Matrix = Matrix;
  } catch (e) {}

}());