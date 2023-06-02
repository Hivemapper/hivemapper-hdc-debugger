 var Code;
  (function(Code2) {
    Code2[Code2["Canceled"] = 1] = "Canceled";
    Code2[Code2["Unknown"] = 2] = "Unknown";
    Code2[Code2["InvalidArgument"] = 3] = "InvalidArgument";
    Code2[Code2["DeadlineExceeded"] = 4] = "DeadlineExceeded";
    Code2[Code2["NotFound"] = 5] = "NotFound";
    Code2[Code2["AlreadyExists"] = 6] = "AlreadyExists";
    Code2[Code2["PermissionDenied"] = 7] = "PermissionDenied";
    Code2[Code2["ResourceExhausted"] = 8] = "ResourceExhausted";
    Code2[Code2["FailedPrecondition"] = 9] = "FailedPrecondition";
    Code2[Code2["Aborted"] = 10] = "Aborted";
    Code2[Code2["OutOfRange"] = 11] = "OutOfRange";
    Code2[Code2["Unimplemented"] = 12] = "Unimplemented";
    Code2[Code2["Internal"] = 13] = "Internal";
    Code2[Code2["Unavailable"] = 14] = "Unavailable";
    Code2[Code2["DataLoss"] = 15] = "DataLoss";
    Code2[Code2["Unauthenticated"] = 16] = "Unauthenticated";
  })(Code || (Code = {}));

  // node_modules/@bufbuild/protobuf/dist/esm/private/assert.js
  function assert(condition, msg) {
    if (!condition) {
      throw new Error(msg);
    }
  }
  var FLOAT32_MAX = 34028234663852886e22;
  var FLOAT32_MIN = -34028234663852886e22;
  var UINT32_MAX = 4294967295;
  var INT32_MAX = 2147483647;
  var INT32_MIN = -2147483648;
  function assertInt32(arg) {
    if (typeof arg !== "number")
      throw new Error("invalid int 32: " + typeof arg);
    if (!Number.isInteger(arg) || arg > INT32_MAX || arg < INT32_MIN)
      throw new Error("invalid int 32: " + arg);
  }
  function assertUInt32(arg) {
    if (typeof arg !== "number")
      throw new Error("invalid uint 32: " + typeof arg);
    if (!Number.isInteger(arg) || arg > UINT32_MAX || arg < 0)
      throw new Error("invalid uint 32: " + arg);
  }
  function assertFloat32(arg) {
    if (typeof arg !== "number")
      throw new Error("invalid float 32: " + typeof arg);
    if (!Number.isFinite(arg))
      return;
    if (arg > FLOAT32_MAX || arg < FLOAT32_MIN)
      throw new Error("invalid float 32: " + arg);
  }

  // node_modules/@bufbuild/protobuf/dist/esm/private/enum.js
  var enumTypeSymbol = Symbol("@bufbuild/protobuf/enum-type");
  function getEnumType(enumObject) {
    const t = enumObject[enumTypeSymbol];
    assert(t, "missing enum type on enum object");
    return t;
  }
  function setEnumType(enumObject, typeName, values, opt) {
    enumObject[enumTypeSymbol] = makeEnumType(typeName, values.map((v) => ({
      no: v.no,
      name: v.name,
      localName: enumObject[v.no]
    })), opt);
  }
  function makeEnumType(typeName, values, _opt) {
    const names = /* @__PURE__ */ Object.create(null);
    const numbers = /* @__PURE__ */ Object.create(null);
    const normalValues = [];
    for (const value of values) {
      const n = normalizeEnumValue(value);
      normalValues.push(n);
      names[value.name] = n;
      numbers[value.no] = n;
    }
    return {
      typeName,
      values: normalValues,
      // We do not surface options at this time
      // options: opt?.options ?? Object.create(null),
      findName(name) {
        return names[name];
      },
      findNumber(no) {
        return numbers[no];
      }
    };
  }
  function makeEnum(typeName, values, opt) {
    const enumObject = {};
    for (const value of values) {
      const n = normalizeEnumValue(value);
      enumObject[n.localName] = n.no;
      enumObject[n.no] = n.localName;
    }
    setEnumType(enumObject, typeName, values, opt);
    return enumObject;
  }
  function normalizeEnumValue(value) {
    if ("localName" in value) {
      return value;
    }
    return Object.assign(Object.assign({}, value), { localName: value.name });
  }

  // node_modules/@bufbuild/protobuf/dist/esm/message.js
  var Message = class {
    /**
     * Compare with a message of the same type.
     */
    equals(other) {
      return this.getType().runtime.util.equals(this.getType(), this, other);
    }
    /**
     * Create a deep copy.
     */
    clone() {
      return this.getType().runtime.util.clone(this);
    }
    /**
     * Parse from binary data, merging fields.
     *
     * Repeated fields are appended. Map entries are added, overwriting
     * existing keys.
     *
     * If a message field is already present, it will be merged with the
     * new data.
     */
    fromBinary(bytes, options) {
      const type = this.getType(), format = type.runtime.bin, opt = format.makeReadOptions(options);
      format.readMessage(this, opt.readerFactory(bytes), bytes.byteLength, opt);
      return this;
    }
    /**
     * Parse a message from a JSON value.
     */
    fromJson(jsonValue, options) {
      const type = this.getType(), format = type.runtime.json, opt = format.makeReadOptions(options);
      format.readMessage(type, jsonValue, opt, this);
      return this;
    }
    /**
     * Parse a message from a JSON string.
     */
    fromJsonString(jsonString, options) {
      let json;
      try {
        json = JSON.parse(jsonString);
      } catch (e) {
        throw new Error(`cannot decode ${this.getType().typeName} from JSON: ${e instanceof Error ? e.message : String(e)}`);
      }
      return this.fromJson(json, options);
    }
    /**
     * Serialize the message to binary data.
     */
    toBinary(options) {
      const type = this.getType(), bin = type.runtime.bin, opt = bin.makeWriteOptions(options), writer = opt.writerFactory();
      bin.writeMessage(this, writer, opt);
      return writer.finish();
    }
    /**
     * Serialize the message to a JSON value, a JavaScript value that can be
     * passed to JSON.stringify().
     */
    toJson(options) {
      const type = this.getType(), json = type.runtime.json, opt = json.makeWriteOptions(options);
      return json.writeMessage(this, opt);
    }
    /**
     * Serialize the message to a JSON string.
     */
    toJsonString(options) {
      var _a;
      const value = this.toJson(options);
      return JSON.stringify(value, null, (_a = options === null || options === void 0 ? void 0 : options.prettySpaces) !== null && _a !== void 0 ? _a : 0);
    }
    /**
     * Override for serialization behavior. This will be invoked when calling
     * JSON.stringify on this message (i.e. JSON.stringify(msg)).
     *
     * Note that this will not serialize google.protobuf.Any with a packed
     * message because the protobuf JSON format specifies that it needs to be
     * unpacked, and this is only possible with a type registry to look up the
     * message type.  As a result, attempting to serialize a message with this
     * type will throw an Error.
     *
     * This method is protected because you should not need to invoke it
     * directly -- instead use JSON.stringify or toJsonString for
     * stringified JSON.  Alternatively, if actual JSON is desired, you should
     * use toJson.
     */
    toJSON() {
      return this.toJson({
        emitDefaultValues: true
      });
    }
    /**
     * Retrieve the MessageType of this message - a singleton that represents
     * the protobuf message declaration and provides metadata for reflection-
     * based operations.
     */
    getType() {
      return Object.getPrototypeOf(this).constructor;
    }
  };

  // node_modules/@bufbuild/protobuf/dist/esm/private/message-type.js
  function makeMessageType(runtime, typeName, fields, opt) {
    var _a;
    const localName = (_a = opt === null || opt === void 0 ? void 0 : opt.localName) !== null && _a !== void 0 ? _a : typeName.substring(typeName.lastIndexOf(".") + 1);
    const type = {
      [localName]: function(data) {
        runtime.util.initFields(this);
        runtime.util.initPartial(data, this);
      }
    }[localName];
    Object.setPrototypeOf(type.prototype, new Message());
    Object.assign(type, {
      runtime,
      typeName,
      fields: runtime.util.newFieldList(fields),
      fromBinary(bytes, options) {
        return new type().fromBinary(bytes, options);
      },
      fromJson(jsonValue, options) {
        return new type().fromJson(jsonValue, options);
      },
      fromJsonString(jsonString, options) {
        return new type().fromJsonString(jsonString, options);
      },
      equals(a, b) {
        return runtime.util.equals(type, a, b);
      }
    });
    return type;
  }

  // node_modules/@bufbuild/protobuf/dist/esm/private/proto-runtime.js
  function makeProtoRuntime(syntax, json, bin, util) {
    return {
      syntax,
      json,
      bin,
      util,
      makeMessageType(typeName, fields, opt) {
        return makeMessageType(this, typeName, fields, opt);
      },
      makeEnum,
      makeEnumType,
      getEnumType
    };
  }

  // node_modules/@bufbuild/protobuf/dist/esm/field.js
  var ScalarType;
  (function(ScalarType2) {
    ScalarType2[ScalarType2["DOUBLE"] = 1] = "DOUBLE";
    ScalarType2[ScalarType2["FLOAT"] = 2] = "FLOAT";
    ScalarType2[ScalarType2["INT64"] = 3] = "INT64";
    ScalarType2[ScalarType2["UINT64"] = 4] = "UINT64";
    ScalarType2[ScalarType2["INT32"] = 5] = "INT32";
    ScalarType2[ScalarType2["FIXED64"] = 6] = "FIXED64";
    ScalarType2[ScalarType2["FIXED32"] = 7] = "FIXED32";
    ScalarType2[ScalarType2["BOOL"] = 8] = "BOOL";
    ScalarType2[ScalarType2["STRING"] = 9] = "STRING";
    ScalarType2[ScalarType2["BYTES"] = 12] = "BYTES";
    ScalarType2[ScalarType2["UINT32"] = 13] = "UINT32";
    ScalarType2[ScalarType2["SFIXED32"] = 15] = "SFIXED32";
    ScalarType2[ScalarType2["SFIXED64"] = 16] = "SFIXED64";
    ScalarType2[ScalarType2["SINT32"] = 17] = "SINT32";
    ScalarType2[ScalarType2["SINT64"] = 18] = "SINT64";
  })(ScalarType || (ScalarType = {}));

  // node_modules/@bufbuild/protobuf/dist/esm/google/varint.js
  function varint64read() {
    let lowBits = 0;
    let highBits = 0;
    for (let shift = 0; shift < 28; shift += 7) {
      let b = this.buf[this.pos++];
      lowBits |= (b & 127) << shift;
      if ((b & 128) == 0) {
        this.assertBounds();
        return [lowBits, highBits];
      }
    }
    let middleByte = this.buf[this.pos++];
    lowBits |= (middleByte & 15) << 28;
    highBits = (middleByte & 112) >> 4;
    if ((middleByte & 128) == 0) {
      this.assertBounds();
      return [lowBits, highBits];
    }
    for (let shift = 3; shift <= 31; shift += 7) {
      let b = this.buf[this.pos++];
      highBits |= (b & 127) << shift;
      if ((b & 128) == 0) {
        this.assertBounds();
        return [lowBits, highBits];
      }
    }
    throw new Error("invalid varint");
  }
  function varint64write(lo, hi, bytes) {
    for (let i = 0; i < 28; i = i + 7) {
      const shift = lo >>> i;
      const hasNext = !(shift >>> 7 == 0 && hi == 0);
      const byte = (hasNext ? shift | 128 : shift) & 255;
      bytes.push(byte);
      if (!hasNext) {
        return;
      }
    }
    const splitBits = lo >>> 28 & 15 | (hi & 7) << 4;
    const hasMoreBits = !(hi >> 3 == 0);
    bytes.push((hasMoreBits ? splitBits | 128 : splitBits) & 255);
    if (!hasMoreBits) {
      return;
    }
    for (let i = 3; i < 31; i = i + 7) {
      const shift = hi >>> i;
      const hasNext = !(shift >>> 7 == 0);
      const byte = (hasNext ? shift | 128 : shift) & 255;
      bytes.push(byte);
      if (!hasNext) {
        return;
      }
    }
    bytes.push(hi >>> 31 & 1);
  }
  var TWO_PWR_32_DBL = 4294967296;
  function int64FromString(dec) {
    const minus = dec[0] === "-";
    if (minus) {
      dec = dec.slice(1);
    }
    const base = 1e6;
    let lowBits = 0;
    let highBits = 0;
    function add1e6digit(begin, end) {
      const digit1e6 = Number(dec.slice(begin, end));
      highBits *= base;
      lowBits = lowBits * base + digit1e6;
      if (lowBits >= TWO_PWR_32_DBL) {
        highBits = highBits + (lowBits / TWO_PWR_32_DBL | 0);
        lowBits = lowBits % TWO_PWR_32_DBL;
      }
    }
    add1e6digit(-24, -18);
    add1e6digit(-18, -12);
    add1e6digit(-12, -6);
    add1e6digit(-6);
    return minus ? negate(lowBits, highBits) : newBits(lowBits, highBits);
  }
  function int64ToString(lo, hi) {
    let bits = newBits(lo, hi);
    const negative = bits.hi & 2147483648;
    if (negative) {
      bits = negate(bits.lo, bits.hi);
    }
    const result = uInt64ToString(bits.lo, bits.hi);
    return negative ? "-" + result : result;
  }
  function uInt64ToString(lo, hi) {
    ({ lo, hi } = toUnsigned(lo, hi));
    if (hi <= 2097151) {
      return String(TWO_PWR_32_DBL * hi + lo);
    }
    const low = lo & 16777215;
    const mid = (lo >>> 24 | hi << 8) & 16777215;
    const high = hi >> 16 & 65535;
    let digitA = low + mid * 6777216 + high * 6710656;
    let digitB = mid + high * 8147497;
    let digitC = high * 2;
    const base = 1e7;
    if (digitA >= base) {
      digitB += Math.floor(digitA / base);
      digitA %= base;
    }
    if (digitB >= base) {
      digitC += Math.floor(digitB / base);
      digitB %= base;
    }
    return digitC.toString() + decimalFrom1e7WithLeadingZeros(digitB) + decimalFrom1e7WithLeadingZeros(digitA);
  }
  function toUnsigned(lo, hi) {
    return { lo: lo >>> 0, hi: hi >>> 0 };
  }
  function newBits(lo, hi) {
    return { lo: lo | 0, hi: hi | 0 };
  }
  function negate(lowBits, highBits) {
    highBits = ~highBits;
    if (lowBits) {
      lowBits = ~lowBits + 1;
    } else {
      highBits += 1;
    }
    return newBits(lowBits, highBits);
  }
  var decimalFrom1e7WithLeadingZeros = (digit1e7) => {
    const partial = String(digit1e7);
    return "0000000".slice(partial.length) + partial;
  };
  function varint32write(value, bytes) {
    if (value >= 0) {
      while (value > 127) {
        bytes.push(value & 127 | 128);
        value = value >>> 7;
      }
      bytes.push(value);
    } else {
      for (let i = 0; i < 9; i++) {
        bytes.push(value & 127 | 128);
        value = value >> 7;
      }
      bytes.push(1);
    }
  }
  function varint32read() {
    let b = this.buf[this.pos++];
    let result = b & 127;
    if ((b & 128) == 0) {
      this.assertBounds();
      return result;
    }
    b = this.buf[this.pos++];
    result |= (b & 127) << 7;
    if ((b & 128) == 0) {
      this.assertBounds();
      return result;
    }
    b = this.buf[this.pos++];
    result |= (b & 127) << 14;
    if ((b & 128) == 0) {
      this.assertBounds();
      return result;
    }
    b = this.buf[this.pos++];
    result |= (b & 127) << 21;
    if ((b & 128) == 0) {
      this.assertBounds();
      return result;
    }
    b = this.buf[this.pos++];
    result |= (b & 15) << 28;
    for (let readBytes = 5; (b & 128) !== 0 && readBytes < 10; readBytes++)
      b = this.buf[this.pos++];
    if ((b & 128) != 0)
      throw new Error("invalid varint");
    this.assertBounds();
    return result >>> 0;
  }

  // node_modules/@bufbuild/protobuf/dist/esm/proto-int64.js
  function makeInt64Support() {
    const dv = new DataView(new ArrayBuffer(8));
    const ok = globalThis.BigInt !== void 0 && typeof dv.getBigInt64 === "function" && typeof dv.getBigUint64 === "function" && typeof dv.setBigInt64 === "function" && typeof dv.setBigUint64 === "function" && (typeof process != "object" || typeof process.env != "object" || process.env.BUF_BIGINT_DISABLE !== "1");
    if (ok) {
      const MIN = BigInt("-9223372036854775808"), MAX = BigInt("9223372036854775807"), UMIN = BigInt("0"), UMAX = BigInt("18446744073709551615");
      return {
        zero: BigInt(0),
        supported: true,
        parse(value) {
          const bi = typeof value == "bigint" ? value : BigInt(value);
          if (bi > MAX || bi < MIN) {
            throw new Error(`int64 invalid: ${value}`);
          }
          return bi;
        },
        uParse(value) {
          const bi = typeof value == "bigint" ? value : BigInt(value);
          if (bi > UMAX || bi < UMIN) {
            throw new Error(`uint64 invalid: ${value}`);
          }
          return bi;
        },
        enc(value) {
          dv.setBigInt64(0, this.parse(value), true);
          return {
            lo: dv.getInt32(0, true),
            hi: dv.getInt32(4, true)
          };
        },
        uEnc(value) {
          dv.setBigInt64(0, this.uParse(value), true);
          return {
            lo: dv.getInt32(0, true),
            hi: dv.getInt32(4, true)
          };
        },
        dec(lo, hi) {
          dv.setInt32(0, lo, true);
          dv.setInt32(4, hi, true);
          return dv.getBigInt64(0, true);
        },
        uDec(lo, hi) {
          dv.setInt32(0, lo, true);
          dv.setInt32(4, hi, true);
          return dv.getBigUint64(0, true);
        }
      };
    }
    const assertInt64String = (value) => assert(/^-?[0-9]+$/.test(value), `int64 invalid: ${value}`);
    const assertUInt64String = (value) => assert(/^[0-9]+$/.test(value), `uint64 invalid: ${value}`);
    return {
      zero: "0",
      supported: false,
      parse(value) {
        if (typeof value != "string") {
          value = value.toString();
        }
        assertInt64String(value);
        return value;
      },
      uParse(value) {
        if (typeof value != "string") {
          value = value.toString();
        }
        assertUInt64String(value);
        return value;
      },
      enc(value) {
        if (typeof value != "string") {
          value = value.toString();
        }
        assertInt64String(value);
        return int64FromString(value);
      },
      uEnc(value) {
        if (typeof value != "string") {
          value = value.toString();
        }
        assertUInt64String(value);
        return int64FromString(value);
      },
      dec(lo, hi) {
        return int64ToString(lo, hi);
      },
      uDec(lo, hi) {
        return uInt64ToString(lo, hi);
      }
    };
  }
  var protoInt64 = makeInt64Support();

  // node_modules/@bufbuild/protobuf/dist/esm/binary-encoding.js
  var WireType;
  (function(WireType2) {
    WireType2[WireType2["Varint"] = 0] = "Varint";
    WireType2[WireType2["Bit64"] = 1] = "Bit64";
    WireType2[WireType2["LengthDelimited"] = 2] = "LengthDelimited";
    WireType2[WireType2["StartGroup"] = 3] = "StartGroup";
    WireType2[WireType2["EndGroup"] = 4] = "EndGroup";
    WireType2[WireType2["Bit32"] = 5] = "Bit32";
  })(WireType || (WireType = {}));
  var BinaryWriter = class {
    constructor(textEncoder) {
      this.stack = [];
      this.textEncoder = textEncoder !== null && textEncoder !== void 0 ? textEncoder : new TextEncoder();
      this.chunks = [];
      this.buf = [];
    }
    /**
     * Return all bytes written and reset this writer.
     */
    finish() {
      this.chunks.push(new Uint8Array(this.buf));
      let len = 0;
      for (let i = 0; i < this.chunks.length; i++)
        len += this.chunks[i].length;
      let bytes = new Uint8Array(len);
      let offset = 0;
      for (let i = 0; i < this.chunks.length; i++) {
        bytes.set(this.chunks[i], offset);
        offset += this.chunks[i].length;
      }
      this.chunks = [];
      return bytes;
    }
    /**
     * Start a new fork for length-delimited data like a message
     * or a packed repeated field.
     *
     * Must be joined later with `join()`.
     */
    fork() {
      this.stack.push({ chunks: this.chunks, buf: this.buf });
      this.chunks = [];
      this.buf = [];
      return this;
    }
    /**
     * Join the last fork. Write its length and bytes, then
     * return to the previous state.
     */
    join() {
      let chunk = this.finish();
      let prev = this.stack.pop();
      if (!prev)
        throw new Error("invalid state, fork stack empty");
      this.chunks = prev.chunks;
      this.buf = prev.buf;
      this.uint32(chunk.byteLength);
      return this.raw(chunk);
    }
    /**
     * Writes a tag (field number and wire type).
     *
     * Equivalent to `uint32( (fieldNo << 3 | type) >>> 0 )`.
     *
     * Generated code should compute the tag ahead of time and call `uint32()`.
     */
    tag(fieldNo, type) {
      return this.uint32((fieldNo << 3 | type) >>> 0);
    }
    /**
     * Write a chunk of raw bytes.
     */
    raw(chunk) {
      if (this.buf.length) {
        this.chunks.push(new Uint8Array(this.buf));
        this.buf = [];
      }
      this.chunks.push(chunk);
      return this;
    }
    /**
     * Write a `uint32` value, an unsigned 32 bit varint.
     */
    uint32(value) {
      assertUInt32(value);
      while (value > 127) {
        this.buf.push(value & 127 | 128);
        value = value >>> 7;
      }
      this.buf.push(value);
      return this;
    }
    /**
     * Write a `int32` value, a signed 32 bit varint.
     */
    int32(value) {
      assertInt32(value);
      varint32write(value, this.buf);
      return this;
    }
    /**
     * Write a `bool` value, a variant.
     */
    bool(value) {
      this.buf.push(value ? 1 : 0);
      return this;
    }
    /**
     * Write a `bytes` value, length-delimited arbitrary data.
     */
    bytes(value) {
      this.uint32(value.byteLength);
      return this.raw(value);
    }
    /**
     * Write a `string` value, length-delimited data converted to UTF-8 text.
     */
    string(value) {
      let chunk = this.textEncoder.encode(value);
      this.uint32(chunk.byteLength);
      return this.raw(chunk);
    }
    /**
     * Write a `float` value, 32-bit floating point number.
     */
    float(value) {
      assertFloat32(value);
      let chunk = new Uint8Array(4);
      new DataView(chunk.buffer).setFloat32(0, value, true);
      return this.raw(chunk);
    }
    /**
     * Write a `double` value, a 64-bit floating point number.
     */
    double(value) {
      let chunk = new Uint8Array(8);
      new DataView(chunk.buffer).setFloat64(0, value, true);
      return this.raw(chunk);
    }
    /**
     * Write a `fixed32` value, an unsigned, fixed-length 32-bit integer.
     */
    fixed32(value) {
      assertUInt32(value);
      let chunk = new Uint8Array(4);
      new DataView(chunk.buffer).setUint32(0, value, true);
      return this.raw(chunk);
    }
    /**
     * Write a `sfixed32` value, a signed, fixed-length 32-bit integer.
     */
    sfixed32(value) {
      assertInt32(value);
      let chunk = new Uint8Array(4);
      new DataView(chunk.buffer).setInt32(0, value, true);
      return this.raw(chunk);
    }
    /**
     * Write a `sint32` value, a signed, zigzag-encoded 32-bit varint.
     */
    sint32(value) {
      assertInt32(value);
      value = (value << 1 ^ value >> 31) >>> 0;
      varint32write(value, this.buf);
      return this;
    }
    /**
     * Write a `fixed64` value, a signed, fixed-length 64-bit integer.
     */
    sfixed64(value) {
      let chunk = new Uint8Array(8), view = new DataView(chunk.buffer), tc = protoInt64.enc(value);
      view.setInt32(0, tc.lo, true);
      view.setInt32(4, tc.hi, true);
      return this.raw(chunk);
    }
    /**
     * Write a `fixed64` value, an unsigned, fixed-length 64 bit integer.
     */
    fixed64(value) {
      let chunk = new Uint8Array(8), view = new DataView(chunk.buffer), tc = protoInt64.uEnc(value);
      view.setInt32(0, tc.lo, true);
      view.setInt32(4, tc.hi, true);
      return this.raw(chunk);
    }
    /**
     * Write a `int64` value, a signed 64-bit varint.
     */
    int64(value) {
      let tc = protoInt64.enc(value);
      varint64write(tc.lo, tc.hi, this.buf);
      return this;
    }
    /**
     * Write a `sint64` value, a signed, zig-zag-encoded 64-bit varint.
     */
    sint64(value) {
      let tc = protoInt64.enc(value), sign = tc.hi >> 31, lo = tc.lo << 1 ^ sign, hi = (tc.hi << 1 | tc.lo >>> 31) ^ sign;
      varint64write(lo, hi, this.buf);
      return this;
    }
    /**
     * Write a `uint64` value, an unsigned 64-bit varint.
     */
    uint64(value) {
      let tc = protoInt64.uEnc(value);
      varint64write(tc.lo, tc.hi, this.buf);
      return this;
    }
  };
  var BinaryReader = class {
    constructor(buf, textDecoder) {
      this.varint64 = varint64read;
      this.uint32 = varint32read;
      this.buf = buf;
      this.len = buf.length;
      this.pos = 0;
      this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      this.textDecoder = textDecoder !== null && textDecoder !== void 0 ? textDecoder : new TextDecoder();
    }
    /**
     * Reads a tag - field number and wire type.
     */
    tag() {
      let tag = this.uint32(), fieldNo = tag >>> 3, wireType = tag & 7;
      if (fieldNo <= 0 || wireType < 0 || wireType > 5)
        throw new Error("illegal tag: field no " + fieldNo + " wire type " + wireType);
      return [fieldNo, wireType];
    }
    /**
     * Skip one element on the wire and return the skipped data.
     * Supports WireType.StartGroup since v2.0.0-alpha.23.
     */
    skip(wireType) {
      let start = this.pos;
      switch (wireType) {
        case WireType.Varint:
          while (this.buf[this.pos++] & 128) {
          }
          break;
        case WireType.Bit64:
          this.pos += 4;
        case WireType.Bit32:
          this.pos += 4;
          break;
        case WireType.LengthDelimited:
          let len = this.uint32();
          this.pos += len;
          break;
        case WireType.StartGroup:
          let t;
          while ((t = this.tag()[1]) !== WireType.EndGroup) {
            this.skip(t);
          }
          break;
        default:
          throw new Error("cant skip wire type " + wireType);
      }
      this.assertBounds();
      return this.buf.subarray(start, this.pos);
    }
    /**
     * Throws error if position in byte array is out of range.
     */
    assertBounds() {
      if (this.pos > this.len)
        throw new RangeError("premature EOF");
    }
    /**
     * Read a `int32` field, a signed 32 bit varint.
     */
    int32() {
      return this.uint32() | 0;
    }
    /**
     * Read a `sint32` field, a signed, zigzag-encoded 32-bit varint.
     */
    sint32() {
      let zze = this.uint32();
      return zze >>> 1 ^ -(zze & 1);
    }
    /**
     * Read a `int64` field, a signed 64-bit varint.
     */
    int64() {
      return protoInt64.dec(...this.varint64());
    }
    /**
     * Read a `uint64` field, an unsigned 64-bit varint.
     */
    uint64() {
      return protoInt64.uDec(...this.varint64());
    }
    /**
     * Read a `sint64` field, a signed, zig-zag-encoded 64-bit varint.
     */
    sint64() {
      let [lo, hi] = this.varint64();
      let s = -(lo & 1);
      lo = (lo >>> 1 | (hi & 1) << 31) ^ s;
      hi = hi >>> 1 ^ s;
      return protoInt64.dec(lo, hi);
    }
    /**
     * Read a `bool` field, a variant.
     */
    bool() {
      let [lo, hi] = this.varint64();
      return lo !== 0 || hi !== 0;
    }
    /**
     * Read a `fixed32` field, an unsigned, fixed-length 32-bit integer.
     */
    fixed32() {
      return this.view.getUint32((this.pos += 4) - 4, true);
    }
    /**
     * Read a `sfixed32` field, a signed, fixed-length 32-bit integer.
     */
    sfixed32() {
      return this.view.getInt32((this.pos += 4) - 4, true);
    }
    /**
     * Read a `fixed64` field, an unsigned, fixed-length 64 bit integer.
     */
    fixed64() {
      return protoInt64.uDec(this.sfixed32(), this.sfixed32());
    }
    /**
     * Read a `fixed64` field, a signed, fixed-length 64-bit integer.
     */
    sfixed64() {
      return protoInt64.dec(this.sfixed32(), this.sfixed32());
    }
    /**
     * Read a `float` field, 32-bit floating point number.
     */
    float() {
      return this.view.getFloat32((this.pos += 4) - 4, true);
    }
    /**
     * Read a `double` field, a 64-bit floating point number.
     */
    double() {
      return this.view.getFloat64((this.pos += 8) - 8, true);
    }
    /**
     * Read a `bytes` field, length-delimited arbitrary data.
     */
    bytes() {
      let len = this.uint32(), start = this.pos;
      this.pos += len;
      this.assertBounds();
      return this.buf.subarray(start, start + len);
    }
    /**
     * Read a `string` field, length-delimited data converted to UTF-8 text.
     */
    string() {
      return this.textDecoder.decode(this.bytes());
    }
  };

  // node_modules/@bufbuild/protobuf/dist/esm/private/field-wrapper.js
  function wrapField(type, value) {
    if (value instanceof Message || !type.fieldWrapper) {
      return value;
    }
    return type.fieldWrapper.wrapField(value);
  }
  var wktWrapperToScalarType = {
    "google.protobuf.DoubleValue": ScalarType.DOUBLE,
    "google.protobuf.FloatValue": ScalarType.FLOAT,
    "google.protobuf.Int64Value": ScalarType.INT64,
    "google.protobuf.UInt64Value": ScalarType.UINT64,
    "google.protobuf.Int32Value": ScalarType.INT32,
    "google.protobuf.UInt32Value": ScalarType.UINT32,
    "google.protobuf.BoolValue": ScalarType.BOOL,
    "google.protobuf.StringValue": ScalarType.STRING,
    "google.protobuf.BytesValue": ScalarType.BYTES
  };

  // node_modules/@bufbuild/protobuf/dist/esm/private/scalars.js
  function scalarEquals(type, a, b) {
    if (a === b) {
      return true;
    }
    if (type == ScalarType.BYTES) {
      if (!(a instanceof Uint8Array) || !(b instanceof Uint8Array)) {
        return false;
      }
      if (a.length !== b.length) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
          return false;
        }
      }
      return true;
    }
    switch (type) {
      case ScalarType.UINT64:
      case ScalarType.FIXED64:
      case ScalarType.INT64:
      case ScalarType.SFIXED64:
      case ScalarType.SINT64:
        return a == b;
    }
    return false;
  }
  function scalarDefaultValue(type) {
    switch (type) {
      case ScalarType.BOOL:
        return false;
      case ScalarType.UINT64:
      case ScalarType.FIXED64:
      case ScalarType.INT64:
      case ScalarType.SFIXED64:
      case ScalarType.SINT64:
        return protoInt64.zero;
      case ScalarType.DOUBLE:
      case ScalarType.FLOAT:
        return 0;
      case ScalarType.BYTES:
        return new Uint8Array(0);
      case ScalarType.STRING:
        return "";
      default:
        return 0;
    }
  }
  function scalarTypeInfo(type, value) {
    const isUndefined = value === void 0;
    let wireType = WireType.Varint;
    let isIntrinsicDefault = value === 0;
    switch (type) {
      case ScalarType.STRING:
        isIntrinsicDefault = isUndefined || !value.length;
        wireType = WireType.LengthDelimited;
        break;
      case ScalarType.BOOL:
        isIntrinsicDefault = value === false;
        break;
      case ScalarType.DOUBLE:
        wireType = WireType.Bit64;
        break;
      case ScalarType.FLOAT:
        wireType = WireType.Bit32;
        break;
      case ScalarType.INT64:
        isIntrinsicDefault = isUndefined || value == 0;
        break;
      case ScalarType.UINT64:
        isIntrinsicDefault = isUndefined || value == 0;
        break;
      case ScalarType.FIXED64:
        isIntrinsicDefault = isUndefined || value == 0;
        wireType = WireType.Bit64;
        break;
      case ScalarType.BYTES:
        isIntrinsicDefault = isUndefined || !value.byteLength;
        wireType = WireType.LengthDelimited;
        break;
      case ScalarType.FIXED32:
        wireType = WireType.Bit32;
        break;
      case ScalarType.SFIXED32:
        wireType = WireType.Bit32;
        break;
      case ScalarType.SFIXED64:
        isIntrinsicDefault = isUndefined || value == 0;
        wireType = WireType.Bit64;
        break;
      case ScalarType.SINT64:
        isIntrinsicDefault = isUndefined || value == 0;
        break;
    }
    const method = ScalarType[type].toLowerCase();
    return [wireType, method, isUndefined || isIntrinsicDefault];
  }

  // node_modules/@bufbuild/protobuf/dist/esm/private/binary-format-common.js
  var unknownFieldsSymbol = Symbol("@bufbuild/protobuf/unknown-fields");
  var readDefaults = {
    readUnknownFields: true,
    readerFactory: (bytes) => new BinaryReader(bytes)
  };
  var writeDefaults = {
    writeUnknownFields: true,
    writerFactory: () => new BinaryWriter()
  };
  function makeReadOptions(options) {
    return options ? Object.assign(Object.assign({}, readDefaults), options) : readDefaults;
  }
  function makeWriteOptions(options) {
    return options ? Object.assign(Object.assign({}, writeDefaults), options) : writeDefaults;
  }
  function makeBinaryFormatCommon() {
    return {
      makeReadOptions,
      makeWriteOptions,
      listUnknownFields(message) {
        var _a;
        return (_a = message[unknownFieldsSymbol]) !== null && _a !== void 0 ? _a : [];
      },
      discardUnknownFields(message) {
        delete message[unknownFieldsSymbol];
      },
      writeUnknownFields(message, writer) {
        const m = message;
        const c = m[unknownFieldsSymbol];
        if (c) {
          for (const f of c) {
            writer.tag(f.no, f.wireType).raw(f.data);
          }
        }
      },
      onUnknownField(message, no, wireType, data) {
        const m = message;
        if (!Array.isArray(m[unknownFieldsSymbol])) {
          m[unknownFieldsSymbol] = [];
        }
        m[unknownFieldsSymbol].push({ no, wireType, data });
      },
      readMessage(message, reader, length, options) {
        const type = message.getType();
        const end = length === void 0 ? reader.len : reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag(), field = type.fields.find(fieldNo);
          if (!field) {
            const data = reader.skip(wireType);
            if (options.readUnknownFields) {
              this.onUnknownField(message, fieldNo, wireType, data);
            }
            continue;
          }
          let target = message, repeated = field.repeated, localName = field.localName;
          if (field.oneof) {
            target = target[field.oneof.localName];
            if (target.case != localName) {
              delete target.value;
            }
            target.case = localName;
            localName = "value";
          }
          switch (field.kind) {
            case "scalar":
            case "enum":
              const scalarType = field.kind == "enum" ? ScalarType.INT32 : field.T;
              if (repeated) {
                let arr = target[localName];
                if (wireType == WireType.LengthDelimited && scalarType != ScalarType.STRING && scalarType != ScalarType.BYTES) {
                  let e = reader.uint32() + reader.pos;
                  while (reader.pos < e) {
                    arr.push(readScalar(reader, scalarType));
                  }
                } else {
                  arr.push(readScalar(reader, scalarType));
                }
              } else {
                target[localName] = readScalar(reader, scalarType);
              }
              break;
            case "message":
              const messageType = field.T;
              if (repeated) {
                target[localName].push(readMessageField(reader, new messageType(), options));
              } else {
                if (target[localName] instanceof Message) {
                  readMessageField(reader, target[localName], options);
                } else {
                  target[localName] = readMessageField(reader, new messageType(), options);
                  if (messageType.fieldWrapper && !field.oneof && !field.repeated) {
                    target[localName] = messageType.fieldWrapper.unwrapField(target[localName]);
                  }
                }
              }
              break;
            case "map":
              let [mapKey, mapVal] = readMapEntry(field, reader, options);
              target[localName][mapKey] = mapVal;
              break;
          }
        }
      }
    };
  }
  function readMessageField(reader, message, options) {
    const format = message.getType().runtime.bin;
    format.readMessage(message, reader, reader.uint32(), options);
    return message;
  }
  function readMapEntry(field, reader, options) {
    const length = reader.uint32(), end = reader.pos + length;
    let key, val;
    while (reader.pos < end) {
      let [fieldNo] = reader.tag();
      switch (fieldNo) {
        case 1:
          key = readScalar(reader, field.K);
          break;
        case 2:
          switch (field.V.kind) {
            case "scalar":
              val = readScalar(reader, field.V.T);
              break;
            case "enum":
              val = reader.int32();
              break;
            case "message":
              val = readMessageField(reader, new field.V.T(), options);
              break;
          }
          break;
      }
    }
    if (key === void 0) {
      let keyRaw = scalarDefaultValue(field.K);
      key = field.K == ScalarType.BOOL ? keyRaw.toString() : keyRaw;
    }
    if (typeof key != "string" && typeof key != "number") {
      key = key.toString();
    }
    if (val === void 0) {
      switch (field.V.kind) {
        case "scalar":
          val = scalarDefaultValue(field.V.T);
          break;
        case "enum":
          val = 0;
          break;
        case "message":
          val = new field.V.T();
          break;
      }
    }
    return [key, val];
  }
  function readScalar(reader, type) {
    switch (type) {
      case ScalarType.STRING:
        return reader.string();
      case ScalarType.BOOL:
        return reader.bool();
      case ScalarType.DOUBLE:
        return reader.double();
      case ScalarType.FLOAT:
        return reader.float();
      case ScalarType.INT32:
        return reader.int32();
      case ScalarType.INT64:
        return reader.int64();
      case ScalarType.UINT64:
        return reader.uint64();
      case ScalarType.FIXED64:
        return reader.fixed64();
      case ScalarType.BYTES:
        return reader.bytes();
      case ScalarType.FIXED32:
        return reader.fixed32();
      case ScalarType.SFIXED32:
        return reader.sfixed32();
      case ScalarType.SFIXED64:
        return reader.sfixed64();
      case ScalarType.SINT64:
        return reader.sint64();
      case ScalarType.UINT32:
        return reader.uint32();
      case ScalarType.SINT32:
        return reader.sint32();
    }
  }
  function writeMapEntry(writer, options, field, key, value) {
    writer.tag(field.no, WireType.LengthDelimited);
    writer.fork();
    let keyValue = key;
    switch (field.K) {
      case ScalarType.INT32:
      case ScalarType.FIXED32:
      case ScalarType.UINT32:
      case ScalarType.SFIXED32:
      case ScalarType.SINT32:
        keyValue = Number.parseInt(key);
        break;
      case ScalarType.BOOL:
        assert(key == "true" || key == "false");
        keyValue = key == "true";
        break;
    }
    writeScalar(writer, field.K, 1, keyValue, true);
    switch (field.V.kind) {
      case "scalar":
        writeScalar(writer, field.V.T, 2, value, true);
        break;
      case "enum":
        writeScalar(writer, ScalarType.INT32, 2, value, true);
        break;
      case "message":
        writeMessageField(writer, options, field.V.T, 2, value);
        break;
    }
    writer.join();
  }
  function writeMessageField(writer, options, type, fieldNo, value) {
    if (value !== void 0) {
      const message = wrapField(type, value);
      writer.tag(fieldNo, WireType.LengthDelimited).bytes(message.toBinary(options));
    }
  }
  function writeScalar(writer, type, fieldNo, value, emitIntrinsicDefault) {
    let [wireType, method, isIntrinsicDefault] = scalarTypeInfo(type, value);
    if (!isIntrinsicDefault || emitIntrinsicDefault) {
      writer.tag(fieldNo, wireType)[method](value);
    }
  }
  function writePacked(writer, type, fieldNo, value) {
    if (!value.length) {
      return;
    }
    writer.tag(fieldNo, WireType.LengthDelimited).fork();
    let [, method] = scalarTypeInfo(type);
    for (let i = 0; i < value.length; i++) {
      writer[method](value[i]);
    }
    writer.join();
  }

  // node_modules/@bufbuild/protobuf/dist/esm/private/binary-format-proto3.js
  function makeBinaryFormatProto3() {
    return Object.assign(Object.assign({}, makeBinaryFormatCommon()), { writeMessage(message, writer, options) {
      const type = message.getType();
      for (const field of type.fields.byNumber()) {
        let value, repeated = field.repeated, localName = field.localName;
        if (field.oneof) {
          const oneof = message[field.oneof.localName];
          if (oneof.case !== localName) {
            continue;
          }
          value = oneof.value;
        } else {
          value = message[localName];
        }
        switch (field.kind) {
          case "scalar":
          case "enum":
            let scalarType = field.kind == "enum" ? ScalarType.INT32 : field.T;
            if (repeated) {
              if (field.packed) {
                writePacked(writer, scalarType, field.no, value);
              } else {
                for (const item of value) {
                  writeScalar(writer, scalarType, field.no, item, true);
                }
              }
            } else {
              if (value !== void 0) {
                writeScalar(writer, scalarType, field.no, value, !!field.oneof || field.opt);
              }
            }
            break;
          case "message":
            if (repeated) {
              for (const item of value) {
                writeMessageField(writer, options, field.T, field.no, item);
              }
            } else {
              writeMessageField(writer, options, field.T, field.no, value);
            }
            break;
          case "map":
            for (const [key, val] of Object.entries(value)) {
              writeMapEntry(writer, options, field, key, val);
            }
            break;
        }
      }
      if (options.writeUnknownFields) {
        this.writeUnknownFields(message, writer);
      }
      return writer;
    } });
  }

  // node_modules/@bufbuild/protobuf/dist/esm/proto-base64.js
  var encTable = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
  var decTable = [];
  for (let i = 0; i < encTable.length; i++)
    decTable[encTable[i].charCodeAt(0)] = i;
  decTable["-".charCodeAt(0)] = encTable.indexOf("+");
  decTable["_".charCodeAt(0)] = encTable.indexOf("/");
  var protoBase64 = {
    /**
     * Decodes a base64 string to a byte array.
     *
     * - ignores white-space, including line breaks and tabs
     * - allows inner padding (can decode concatenated base64 strings)
     * - does not require padding
     * - understands base64url encoding:
     *   "-" instead of "+",
     *   "_" instead of "/",
     *   no padding
     */
    dec(base64Str) {
      let es = base64Str.length * 3 / 4;
      if (base64Str[base64Str.length - 2] == "=")
        es -= 2;
      else if (base64Str[base64Str.length - 1] == "=")
        es -= 1;
      let bytes = new Uint8Array(es), bytePos = 0, groupPos = 0, b, p = 0;
      for (let i = 0; i < base64Str.length; i++) {
        b = decTable[base64Str.charCodeAt(i)];
        if (b === void 0) {
          switch (base64Str[i]) {
            case "=":
              groupPos = 0;
            case "\n":
            case "\r":
            case "	":
            case " ":
              continue;
            default:
              throw Error("invalid base64 string.");
          }
        }
        switch (groupPos) {
          case 0:
            p = b;
            groupPos = 1;
            break;
          case 1:
            bytes[bytePos++] = p << 2 | (b & 48) >> 4;
            p = b;
            groupPos = 2;
            break;
          case 2:
            bytes[bytePos++] = (p & 15) << 4 | (b & 60) >> 2;
            p = b;
            groupPos = 3;
            break;
          case 3:
            bytes[bytePos++] = (p & 3) << 6 | b;
            groupPos = 0;
            break;
        }
      }
      if (groupPos == 1)
        throw Error("invalid base64 string.");
      return bytes.subarray(0, bytePos);
    },
    /**
     * Encode a byte array to a base64 string.
     */
    enc(bytes) {
      let base64 = "", groupPos = 0, b, p = 0;
      for (let i = 0; i < bytes.length; i++) {
        b = bytes[i];
        switch (groupPos) {
          case 0:
            base64 += encTable[b >> 2];
            p = (b & 3) << 4;
            groupPos = 1;
            break;
          case 1:
            base64 += encTable[p | b >> 4];
            p = (b & 15) << 2;
            groupPos = 2;
            break;
          case 2:
            base64 += encTable[p | b >> 6];
            base64 += encTable[b & 63];
            groupPos = 0;
            break;
        }
      }
      if (groupPos) {
        base64 += encTable[p];
        base64 += "=";
        if (groupPos == 1)
          base64 += "=";
      }
      return base64;
    }
  };

  // node_modules/@bufbuild/protobuf/dist/esm/private/json-format-common.js
  var jsonReadDefaults = {
    ignoreUnknownFields: false
  };
  var jsonWriteDefaults = {
    emitDefaultValues: false,
    enumAsInteger: false,
    useProtoFieldName: false,
    prettySpaces: 0
  };
  function makeReadOptions2(options) {
    return options ? Object.assign(Object.assign({}, jsonReadDefaults), options) : jsonReadDefaults;
  }
  function makeWriteOptions2(options) {
    return options ? Object.assign(Object.assign({}, jsonWriteDefaults), options) : jsonWriteDefaults;
  }
  function makeJsonFormatCommon(makeWriteField) {
    const writeField = makeWriteField(writeEnum, writeScalar2);
    return {
      makeReadOptions: makeReadOptions2,
      makeWriteOptions: makeWriteOptions2,
      readMessage(type, json, options, message) {
        if (json == null || Array.isArray(json) || typeof json != "object") {
          throw new Error(`cannot decode message ${type.typeName} from JSON: ${this.debug(json)}`);
        }
        message = message !== null && message !== void 0 ? message : new type();
        const oneofSeen = {};
        for (const [jsonKey, jsonValue] of Object.entries(json)) {
          const field = type.fields.findJsonName(jsonKey);
          if (!field) {
            if (!options.ignoreUnknownFields) {
              throw new Error(`cannot decode message ${type.typeName} from JSON: key "${jsonKey}" is unknown`);
            }
            continue;
          }
          let localName = field.localName;
          let target = message;
          if (field.oneof) {
            if (jsonValue === null && field.kind == "scalar") {
              continue;
            }
            const seen = oneofSeen[field.oneof.localName];
            if (seen) {
              throw new Error(`cannot decode message ${type.typeName} from JSON: multiple keys for oneof "${field.oneof.name}" present: "${seen}", "${jsonKey}"`);
            }
            oneofSeen[field.oneof.localName] = jsonKey;
            target = target[field.oneof.localName] = { case: localName };
            localName = "value";
          }
          if (field.repeated) {
            if (jsonValue === null) {
              continue;
            }
            if (!Array.isArray(jsonValue)) {
              throw new Error(`cannot decode field ${type.typeName}.${field.name} from JSON: ${this.debug(jsonValue)}`);
            }
            const targetArray = target[localName];
            for (const jsonItem of jsonValue) {
              if (jsonItem === null) {
                throw new Error(`cannot decode field ${type.typeName}.${field.name} from JSON: ${this.debug(jsonItem)}`);
              }
              let val;
              switch (field.kind) {
                case "message":
                  val = field.T.fromJson(jsonItem, options);
                  break;
                case "enum":
                  val = readEnum(field.T, jsonItem, options.ignoreUnknownFields);
                  if (val === void 0)
                    continue;
                  break;
                case "scalar":
                  try {
                    val = readScalar2(field.T, jsonItem);
                  } catch (e) {
                    let m = `cannot decode field ${type.typeName}.${field.name} from JSON: ${this.debug(jsonItem)}`;
                    if (e instanceof Error && e.message.length > 0) {
                      m += `: ${e.message}`;
                    }
                    throw new Error(m);
                  }
                  break;
              }
              targetArray.push(val);
            }
          } else if (field.kind == "map") {
            if (jsonValue === null) {
              continue;
            }
            if (Array.isArray(jsonValue) || typeof jsonValue != "object") {
              throw new Error(`cannot decode field ${type.typeName}.${field.name} from JSON: ${this.debug(jsonValue)}`);
            }
            const targetMap = target[localName];
            for (const [jsonMapKey, jsonMapValue] of Object.entries(jsonValue)) {
              if (jsonMapValue === null) {
                throw new Error(`cannot decode field ${type.typeName}.${field.name} from JSON: map value null`);
              }
              let val;
              switch (field.V.kind) {
                case "message":
                  val = field.V.T.fromJson(jsonMapValue, options);
                  break;
                case "enum":
                  val = readEnum(field.V.T, jsonMapValue, options.ignoreUnknownFields);
                  if (val === void 0)
                    continue;
                  break;
                case "scalar":
                  try {
                    val = readScalar2(field.V.T, jsonMapValue);
                  } catch (e) {
                    let m = `cannot decode map value for field ${type.typeName}.${field.name} from JSON: ${this.debug(jsonValue)}`;
                    if (e instanceof Error && e.message.length > 0) {
                      m += `: ${e.message}`;
                    }
                    throw new Error(m);
                  }
                  break;
              }
              try {
                targetMap[readScalar2(field.K, field.K == ScalarType.BOOL ? jsonMapKey == "true" ? true : jsonMapKey == "false" ? false : jsonMapKey : jsonMapKey).toString()] = val;
              } catch (e) {
                let m = `cannot decode map key for field ${type.typeName}.${field.name} from JSON: ${this.debug(jsonValue)}`;
                if (e instanceof Error && e.message.length > 0) {
                  m += `: ${e.message}`;
                }
                throw new Error(m);
              }
            }
          } else {
            switch (field.kind) {
              case "message":
                const messageType = field.T;
                if (jsonValue === null && messageType.typeName != "google.protobuf.Value") {
                  if (field.oneof) {
                    throw new Error(`cannot decode field ${type.typeName}.${field.name} from JSON: null is invalid for oneof field "${jsonKey}"`);
                  }
                  continue;
                }
                if (target[localName] instanceof Message) {
                  target[localName].fromJson(jsonValue, options);
                } else {
                  target[localName] = messageType.fromJson(jsonValue, options);
                  if (messageType.fieldWrapper && !field.oneof) {
                    target[localName] = messageType.fieldWrapper.unwrapField(target[localName]);
                  }
                }
                break;
              case "enum":
                const enumValue = readEnum(field.T, jsonValue, options.ignoreUnknownFields);
                if (enumValue !== void 0) {
                  target[localName] = enumValue;
                }
                break;
              case "scalar":
                try {
                  target[localName] = readScalar2(field.T, jsonValue);
                } catch (e) {
                  let m = `cannot decode field ${type.typeName}.${field.name} from JSON: ${this.debug(jsonValue)}`;
                  if (e instanceof Error && e.message.length > 0) {
                    m += `: ${e.message}`;
                  }
                  throw new Error(m);
                }
                break;
            }
          }
        }
        return message;
      },
      writeMessage(message, options) {
        const type = message.getType();
        const json = {};
        let field;
        try {
          for (const member of type.fields.byMember()) {
            let jsonValue;
            if (member.kind == "oneof") {
              const oneof = message[member.localName];
              if (oneof.value === void 0) {
                continue;
              }
              field = member.findField(oneof.case);
              if (!field) {
                throw "oneof case not found: " + oneof.case;
              }
              jsonValue = writeField(field, oneof.value, options);
            } else {
              field = member;
              jsonValue = writeField(field, message[field.localName], options);
            }
            if (jsonValue !== void 0) {
              json[options.useProtoFieldName ? field.name : field.jsonName] = jsonValue;
            }
          }
        } catch (e) {
          const m = field ? `cannot encode field ${type.typeName}.${field.name} to JSON` : `cannot encode message ${type.typeName} to JSON`;
          const r = e instanceof Error ? e.message : String(e);
          throw new Error(m + (r.length > 0 ? `: ${r}` : ""));
        }
        return json;
      },
      readScalar: readScalar2,
      writeScalar: writeScalar2,
      debug: debugJsonValue
    };
  }
  function debugJsonValue(json) {
    if (json === null) {
      return "null";
    }
    switch (typeof json) {
      case "object":
        return Array.isArray(json) ? "array" : "object";
      case "string":
        return json.length > 100 ? "string" : `"${json.split('"').join('\\"')}"`;
      default:
        return json.toString();
    }
  }
  function readScalar2(type, json) {
    switch (type) {
      case ScalarType.DOUBLE:
      case ScalarType.FLOAT:
        if (json === null)
          return 0;
        if (json === "NaN")
          return Number.NaN;
        if (json === "Infinity")
          return Number.POSITIVE_INFINITY;
        if (json === "-Infinity")
          return Number.NEGATIVE_INFINITY;
        if (json === "") {
          break;
        }
        if (typeof json == "string" && json.trim().length !== json.length) {
          break;
        }
        if (typeof json != "string" && typeof json != "number") {
          break;
        }
        const float = Number(json);
        if (Number.isNaN(float)) {
          break;
        }
        if (!Number.isFinite(float)) {
          break;
        }
        if (type == ScalarType.FLOAT)
          assertFloat32(float);
        return float;
      case ScalarType.INT32:
      case ScalarType.FIXED32:
      case ScalarType.SFIXED32:
      case ScalarType.SINT32:
      case ScalarType.UINT32:
        if (json === null)
          return 0;
        let int32;
        if (typeof json == "number")
          int32 = json;
        else if (typeof json == "string" && json.length > 0) {
          if (json.trim().length === json.length)
            int32 = Number(json);
        }
        if (int32 === void 0)
          break;
        if (type == ScalarType.UINT32)
          assertUInt32(int32);
        else
          assertInt32(int32);
        return int32;
      case ScalarType.INT64:
      case ScalarType.SFIXED64:
      case ScalarType.SINT64:
        if (json === null)
          return protoInt64.zero;
        if (typeof json != "number" && typeof json != "string")
          break;
        return protoInt64.parse(json);
      case ScalarType.FIXED64:
      case ScalarType.UINT64:
        if (json === null)
          return protoInt64.zero;
        if (typeof json != "number" && typeof json != "string")
          break;
        return protoInt64.uParse(json);
      case ScalarType.BOOL:
        if (json === null)
          return false;
        if (typeof json !== "boolean")
          break;
        return json;
      case ScalarType.STRING:
        if (json === null)
          return "";
        if (typeof json !== "string") {
          break;
        }
        try {
          encodeURIComponent(json);
        } catch (e) {
          throw new Error("invalid UTF8");
        }
        return json;
      case ScalarType.BYTES:
        if (json === null || json === "")
          return new Uint8Array(0);
        if (typeof json !== "string")
          break;
        return protoBase64.dec(json);
    }
    throw new Error();
  }
  function readEnum(type, json, ignoreUnknownFields) {
    if (json === null) {
      return 0;
    }
    switch (typeof json) {
      case "number":
        if (Number.isInteger(json)) {
          return json;
        }
        break;
      case "string":
        const value = type.findName(json);
        if (value || ignoreUnknownFields) {
          return value === null || value === void 0 ? void 0 : value.no;
        }
        break;
    }
    throw new Error(`cannot decode enum ${type.typeName} from JSON: ${debugJsonValue(json)}`);
  }
  function writeEnum(type, value, emitIntrinsicDefault, enumAsInteger) {
    var _a;
    if (value === void 0) {
      return value;
    }
    if (value === 0 && !emitIntrinsicDefault) {
      return void 0;
    }
    if (enumAsInteger) {
      return value;
    }
    if (type.typeName == "google.protobuf.NullValue") {
      return null;
    }
    const val = type.findNumber(value);
    return (_a = val === null || val === void 0 ? void 0 : val.name) !== null && _a !== void 0 ? _a : value;
  }
  function writeScalar2(type, value, emitIntrinsicDefault) {
    if (value === void 0) {
      return void 0;
    }
    switch (type) {
      case ScalarType.INT32:
      case ScalarType.SFIXED32:
      case ScalarType.SINT32:
      case ScalarType.FIXED32:
      case ScalarType.UINT32:
        assert(typeof value == "number");
        return value != 0 || emitIntrinsicDefault ? value : void 0;
      case ScalarType.FLOAT:
      case ScalarType.DOUBLE:
        assert(typeof value == "number");
        if (Number.isNaN(value))
          return "NaN";
        if (value === Number.POSITIVE_INFINITY)
          return "Infinity";
        if (value === Number.NEGATIVE_INFINITY)
          return "-Infinity";
        return value !== 0 || emitIntrinsicDefault ? value : void 0;
      case ScalarType.STRING:
        assert(typeof value == "string");
        return value.length > 0 || emitIntrinsicDefault ? value : void 0;
      case ScalarType.BOOL:
        assert(typeof value == "boolean");
        return value || emitIntrinsicDefault ? value : void 0;
      case ScalarType.UINT64:
      case ScalarType.FIXED64:
      case ScalarType.INT64:
      case ScalarType.SFIXED64:
      case ScalarType.SINT64:
        assert(typeof value == "bigint" || typeof value == "string" || typeof value == "number");
        return emitIntrinsicDefault || value != 0 ? value.toString(10) : void 0;
      case ScalarType.BYTES:
        assert(value instanceof Uint8Array);
        return emitIntrinsicDefault || value.byteLength > 0 ? protoBase64.enc(value) : void 0;
    }
  }

  // node_modules/@bufbuild/protobuf/dist/esm/private/json-format-proto3.js
  function makeJsonFormatProto3() {
    return makeJsonFormatCommon((writeEnum2, writeScalar3) => {
      return function writeField(field, value, options) {
        if (field.kind == "map") {
          const jsonObj = {};
          switch (field.V.kind) {
            case "scalar":
              for (const [entryKey, entryValue] of Object.entries(value)) {
                const val = writeScalar3(field.V.T, entryValue, true);
                assert(val !== void 0);
                jsonObj[entryKey.toString()] = val;
              }
              break;
            case "message":
              for (const [entryKey, entryValue] of Object.entries(value)) {
                jsonObj[entryKey.toString()] = entryValue.toJson(options);
              }
              break;
            case "enum":
              const enumType = field.V.T;
              for (const [entryKey, entryValue] of Object.entries(value)) {
                assert(entryValue === void 0 || typeof entryValue == "number");
                const val = writeEnum2(enumType, entryValue, true, options.enumAsInteger);
                assert(val !== void 0);
                jsonObj[entryKey.toString()] = val;
              }
              break;
          }
          return options.emitDefaultValues || Object.keys(jsonObj).length > 0 ? jsonObj : void 0;
        } else if (field.repeated) {
          const jsonArr = [];
          switch (field.kind) {
            case "scalar":
              for (let i = 0; i < value.length; i++) {
                jsonArr.push(writeScalar3(field.T, value[i], true));
              }
              break;
            case "enum":
              for (let i = 0; i < value.length; i++) {
                jsonArr.push(writeEnum2(field.T, value[i], true, options.enumAsInteger));
              }
              break;
            case "message":
              for (let i = 0; i < value.length; i++) {
                jsonArr.push(wrapField(field.T, value[i]).toJson(options));
              }
              break;
          }
          return options.emitDefaultValues || jsonArr.length > 0 ? jsonArr : void 0;
        } else {
          switch (field.kind) {
            case "scalar":
              return writeScalar3(field.T, value, !!field.oneof || field.opt || options.emitDefaultValues);
            case "enum":
              return writeEnum2(field.T, value, !!field.oneof || field.opt || options.emitDefaultValues, options.enumAsInteger);
            case "message":
              return value !== void 0 ? wrapField(field.T, value).toJson(options) : void 0;
          }
        }
      };
    });
  }

  // node_modules/@bufbuild/protobuf/dist/esm/private/util-common.js
  function makeUtilCommon() {
    return {
      setEnumType,
      initPartial(source, target) {
        if (source === void 0) {
          return;
        }
        const type = target.getType();
        for (const member of type.fields.byMember()) {
          const localName = member.localName, t = target, s = source;
          if (s[localName] === void 0) {
            continue;
          }
          switch (member.kind) {
            case "oneof":
              const sk = s[localName].case;
              if (sk === void 0) {
                continue;
              }
              const sourceField = member.findField(sk);
              let val = s[localName].value;
              if (sourceField && sourceField.kind == "message" && !(val instanceof sourceField.T)) {
                val = new sourceField.T(val);
              }
              t[localName] = { case: sk, value: val };
              break;
            case "scalar":
            case "enum":
              t[localName] = s[localName];
              break;
            case "map":
              switch (member.V.kind) {
                case "scalar":
                case "enum":
                  Object.assign(t[localName], s[localName]);
                  break;
                case "message":
                  const messageType = member.V.T;
                  for (const k of Object.keys(s[localName])) {
                    let val2 = s[localName][k];
                    if (!messageType.fieldWrapper) {
                      val2 = new messageType(val2);
                    }
                    t[localName][k] = val2;
                  }
                  break;
              }
              break;
            case "message":
              const mt = member.T;
              if (member.repeated) {
                t[localName] = s[localName].map((val2) => val2 instanceof mt ? val2 : new mt(val2));
              } else if (s[localName] !== void 0) {
                const val2 = s[localName];
                if (mt.fieldWrapper) {
                  t[localName] = val2;
                } else {
                  t[localName] = val2 instanceof mt ? val2 : new mt(val2);
                }
              }
              break;
          }
        }
      },
      equals(type, a, b) {
        if (a === b) {
          return true;
        }
        if (!a || !b) {
          return false;
        }
        return type.fields.byMember().every((m) => {
          const va = a[m.localName];
          const vb = b[m.localName];
          if (m.repeated) {
            if (va.length !== vb.length) {
              return false;
            }
            switch (m.kind) {
              case "message":
                return va.every((a2, i) => m.T.equals(a2, vb[i]));
              case "scalar":
                return va.every((a2, i) => scalarEquals(m.T, a2, vb[i]));
              case "enum":
                return va.every((a2, i) => scalarEquals(ScalarType.INT32, a2, vb[i]));
            }
            throw new Error(`repeated cannot contain ${m.kind}`);
          }
          switch (m.kind) {
            case "message":
              return m.T.equals(va, vb);
            case "enum":
              return scalarEquals(ScalarType.INT32, va, vb);
            case "scalar":
              return scalarEquals(m.T, va, vb);
            case "oneof":
              if (va.case !== vb.case) {
                return false;
              }
              const s = m.findField(va.case);
              if (s === void 0) {
                return true;
              }
              switch (s.kind) {
                case "message":
                  return s.T.equals(va.value, vb.value);
                case "enum":
                  return scalarEquals(ScalarType.INT32, va.value, vb.value);
                case "scalar":
                  return scalarEquals(s.T, va.value, vb.value);
              }
              throw new Error(`oneof cannot contain ${s.kind}`);
            case "map":
              const keys = Object.keys(va).concat(Object.keys(vb));
              switch (m.V.kind) {
                case "message":
                  const messageType = m.V.T;
                  return keys.every((k) => messageType.equals(va[k], vb[k]));
                case "enum":
                  return keys.every((k) => scalarEquals(ScalarType.INT32, va[k], vb[k]));
                case "scalar":
                  const scalarType = m.V.T;
                  return keys.every((k) => scalarEquals(scalarType, va[k], vb[k]));
              }
              break;
          }
        });
      },
      clone(message) {
        const type = message.getType(), target = new type(), any = target;
        for (const member of type.fields.byMember()) {
          const source = message[member.localName];
          let copy;
          if (member.repeated) {
            copy = source.map((e) => cloneSingularField(member, e));
          } else if (member.kind == "map") {
            copy = any[member.localName];
            for (const [key, v] of Object.entries(source)) {
              copy[key] = cloneSingularField(member.V, v);
            }
          } else if (member.kind == "oneof") {
            const f = member.findField(source.case);
            copy = f ? { case: source.case, value: cloneSingularField(f, source.value) } : { case: void 0 };
          } else {
            copy = cloneSingularField(member, source);
          }
          any[member.localName] = copy;
        }
        return target;
      }
    };
  }
  function cloneSingularField(field, value) {
    if (value === void 0) {
      return value;
    }
    if (value instanceof Message) {
      return value.clone();
    }
    if (value instanceof Uint8Array) {
      const c = new Uint8Array(value.byteLength);
      c.set(value);
      return c;
    }
    return value;
  }

  // node_modules/@bufbuild/protobuf/dist/esm/private/field-list.js
  var InternalFieldList = class {
    constructor(fields, normalizer) {
      this._fields = fields;
      this._normalizer = normalizer;
    }
    findJsonName(jsonName) {
      if (!this.jsonNames) {
        const t = {};
        for (const f of this.list()) {
          t[f.jsonName] = t[f.name] = f;
        }
        this.jsonNames = t;
      }
      return this.jsonNames[jsonName];
    }
    find(fieldNo) {
      if (!this.numbers) {
        const t = {};
        for (const f of this.list()) {
          t[f.no] = f;
        }
        this.numbers = t;
      }
      return this.numbers[fieldNo];
    }
    list() {
      if (!this.all) {
        this.all = this._normalizer(this._fields);
      }
      return this.all;
    }
    byNumber() {
      if (!this.numbersAsc) {
        this.numbersAsc = this.list().concat().sort((a, b) => a.no - b.no);
      }
      return this.numbersAsc;
    }
    byMember() {
      if (!this.members) {
        this.members = [];
        const a = this.members;
        let o;
        for (const f of this.list()) {
          if (f.oneof) {
            if (f.oneof !== o) {
              o = f.oneof;
              a.push(o);
            }
          } else {
            a.push(f);
          }
        }
      }
      return this.members;
    }
  };

  // node_modules/@bufbuild/protobuf/dist/esm/private/names.js
  function localFieldName(protoName, inOneof) {
    const name = protoCamelCase(protoName);
    if (inOneof) {
      return name;
    }
    return safeObjectProperty(safeMessageProperty(name));
  }
  function localOneofName(protoName) {
    return localFieldName(protoName, false);
  }
  var fieldJsonName = protoCamelCase;
  function protoCamelCase(snakeCase) {
    let capNext = false;
    const b = [];
    for (let i = 0; i < snakeCase.length; i++) {
      let c = snakeCase.charAt(i);
      switch (c) {
        case "_":
          capNext = true;
          break;
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          b.push(c);
          capNext = false;
          break;
        default:
          if (capNext) {
            capNext = false;
            c = c.toUpperCase();
          }
          b.push(c);
          break;
      }
    }
    return b.join("");
  }
  var reservedObjectProperties = /* @__PURE__ */ new Set([
    // names reserved by JavaScript
    "constructor",
    "toString",
    "toJSON",
    "valueOf"
  ]);
  var reservedMessageProperties = /* @__PURE__ */ new Set([
    // names reserved by the runtime
    "getType",
    "clone",
    "equals",
    "fromBinary",
    "fromJson",
    "fromJsonString",
    "toBinary",
    "toJson",
    "toJsonString",
    // names reserved by the runtime for the future
    "toObject"
  ]);
  var fallback = (name) => `${name}$`;
  var safeMessageProperty = (name) => {
    if (reservedMessageProperties.has(name)) {
      return fallback(name);
    }
    return name;
  };
  var safeObjectProperty = (name) => {
    if (reservedObjectProperties.has(name)) {
      return fallback(name);
    }
    return name;
  };

  // node_modules/@bufbuild/protobuf/dist/esm/private/field.js
  var InternalOneofInfo = class {
    constructor(name) {
      this.kind = "oneof";
      this.repeated = false;
      this.packed = false;
      this.opt = false;
      this.default = void 0;
      this.fields = [];
      this.name = name;
      this.localName = localOneofName(name);
    }
    addField(field) {
      assert(field.oneof === this, `field ${field.name} not one of ${this.name}`);
      this.fields.push(field);
    }
    findField(localName) {
      if (!this._lookup) {
        this._lookup = /* @__PURE__ */ Object.create(null);
        for (let i = 0; i < this.fields.length; i++) {
          this._lookup[this.fields[i].localName] = this.fields[i];
        }
      }
      return this._lookup[localName];
    }
  };

  // node_modules/@bufbuild/protobuf/dist/esm/proto3.js
  var proto3 = makeProtoRuntime("proto3", makeJsonFormatProto3(), makeBinaryFormatProto3(), Object.assign(Object.assign({}, makeUtilCommon()), {
    newFieldList(fields) {
      return new InternalFieldList(fields, normalizeFieldInfosProto3);
    },
    initFields(target) {
      for (const member of target.getType().fields.byMember()) {
        if (member.opt) {
          continue;
        }
        const name = member.localName, t = target;
        if (member.repeated) {
          t[name] = [];
          continue;
        }
        switch (member.kind) {
          case "oneof":
            t[name] = { case: void 0 };
            break;
          case "enum":
            t[name] = 0;
            break;
          case "map":
            t[name] = {};
            break;
          case "scalar":
            t[name] = scalarDefaultValue(member.T);
            break;
          case "message":
            break;
        }
      }
    }
  }));
  function normalizeFieldInfosProto3(fieldInfos) {
    var _a, _b, _c;
    const r = [];
    let o;
    for (const field of typeof fieldInfos == "function" ? fieldInfos() : fieldInfos) {
      const f = field;
      f.localName = localFieldName(field.name, field.oneof !== void 0);
      f.jsonName = (_a = field.jsonName) !== null && _a !== void 0 ? _a : fieldJsonName(field.name);
      f.repeated = (_b = field.repeated) !== null && _b !== void 0 ? _b : false;
      f.packed = (_c = field.packed) !== null && _c !== void 0 ? _c : field.kind == "enum" || field.kind == "scalar" && field.T != ScalarType.BYTES && field.T != ScalarType.STRING;
      if (field.oneof !== void 0) {
        const ooname = typeof field.oneof == "string" ? field.oneof : field.oneof.name;
        if (!o || o.name != ooname) {
          o = new InternalOneofInfo(ooname);
        }
        f.oneof = o;
        o.addField(f);
      }
      r.push(f);
    }
    return r;
  }

  // node_modules/@bufbuild/protobuf/dist/esm/service-type.js
  var MethodKind;
  (function(MethodKind2) {
    MethodKind2[MethodKind2["Unary"] = 0] = "Unary";
    MethodKind2[MethodKind2["ServerStreaming"] = 1] = "ServerStreaming";
    MethodKind2[MethodKind2["ClientStreaming"] = 2] = "ClientStreaming";
    MethodKind2[MethodKind2["BiDiStreaming"] = 3] = "BiDiStreaming";
  })(MethodKind || (MethodKind = {}));
  var MethodIdempotency;
  (function(MethodIdempotency2) {
    MethodIdempotency2[MethodIdempotency2["NoSideEffects"] = 1] = "NoSideEffects";
    MethodIdempotency2[MethodIdempotency2["Idempotent"] = 2] = "Idempotent";
  })(MethodIdempotency || (MethodIdempotency = {}));

  // node_modules/@bufbuild/connect/dist/esm/protocol-connect/code-string.js
  function codeToString(value) {
    const name = Code[value];
    if (typeof name != "string") {
      return value.toString();
    }
    return name[0].toLowerCase() + name.substring(1).replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
  }
  var stringToCode;
  function codeFromString(value) {
    if (!stringToCode) {
      stringToCode = {};
      for (const value2 of Object.values(Code)) {
        if (typeof value2 == "string") {
          continue;
        }
        stringToCode[codeToString(value2)] = value2;
      }
    }
    return stringToCode[value];
  }

  // node_modules/@bufbuild/connect/dist/esm/connect-error.js
  var ConnectError = class extends Error {
    /**
     * Create a new ConnectError.
     * If no code is provided, code "unknown" is used.
     * Outgoing details are only relevant for the server side - a service may
     * raise an error with details, and it is up to the protocol implementation
     * to encode and send the details along with error.
     */
    constructor(message, code = Code.Unknown, metadata, outgoingDetails, cause) {
      super(createMessage(message, code));
      this.name = "ConnectError";
      Object.setPrototypeOf(this, new.target.prototype);
      this.rawMessage = message;
      this.code = code;
      this.metadata = new Headers(metadata !== null && metadata !== void 0 ? metadata : {});
      this.details = outgoingDetails !== null && outgoingDetails !== void 0 ? outgoingDetails : [];
      this.cause = cause;
    }
    /**
     * Convert any value - typically a caught error into a ConnectError,
     * following these rules:
     * - If the value is already a ConnectError, return it as is.
     * - If the value is an AbortError from the fetch API, return the message
     *   of the AbortError with code Canceled.
     * - For other Errors, return the error message with code Unknown by default.
     * - For other values, return the values String representation as a message,
     *   with the code Unknown by default.
     */
    static from(reason, code = Code.Unknown) {
      if (reason instanceof ConnectError) {
        return reason;
      }
      if (reason instanceof Error) {
        if (reason.name == "AbortError") {
          return new ConnectError(reason.message, Code.Canceled);
        }
        return new ConnectError(reason.message, code);
      }
      return new ConnectError(String(reason), code);
    }
    findDetails(typeOrRegistry) {
      const registry = "typeName" in typeOrRegistry ? {
        findMessage: (typeName) => typeName === typeOrRegistry.typeName ? typeOrRegistry : void 0
      } : typeOrRegistry;
      const details = [];
      for (const data of this.details) {
        if (data instanceof Message) {
          if (registry.findMessage(data.getType().typeName)) {
            details.push(data);
          }
          continue;
        }
        const type = registry.findMessage(data.type);
        if (type) {
          try {
            details.push(type.fromBinary(data.value));
          } catch (_) {
          }
        }
      }
      return details;
    }
  };
  function createMessage(message, code) {
    return message.length ? `[${codeToString(code)}] ${message}` : `[${codeToString(code)}]`;
  }

  // node_modules/@bufbuild/connect/dist/esm/http-headers.js
  function appendHeaders(...headers) {
    const h = new Headers();
    for (const e of headers) {
      e.forEach((value, key) => {
        h.append(key, value);
      });
    }
    return h;
  }

  // node_modules/@bufbuild/connect/dist/esm/any-client.js
  function makeAnyClient(service, createMethod) {
    const client2 = {};
    for (const [localName, methodInfo] of Object.entries(service.methods)) {
      const method = createMethod(Object.assign(Object.assign({}, methodInfo), {
        localName,
        service
      }));
      if (method != null) {
        client2[localName] = method;
      }
    }
    return client2;
  }

  // node_modules/@bufbuild/connect/dist/esm/protocol/envelope.js
  function createEnvelopeReadableStream(stream) {
    let reader;
    let buffer = new Uint8Array(0);
    function append(chunk) {
      const n = new Uint8Array(buffer.length + chunk.length);
      n.set(buffer);
      n.set(chunk, buffer.length);
      buffer = n;
    }
    return new ReadableStream({
      start() {
        reader = stream.getReader();
      },
      async pull(controller) {
        let header = void 0;
        for (; ; ) {
          if (header === void 0 && buffer.byteLength >= 5) {
            let length = 0;
            for (let i = 1; i < 5; i++) {
              length = (length << 8) + buffer[i];
            }
            header = { flags: buffer[0], length };
          }
          if (header !== void 0 && buffer.byteLength >= header.length + 5) {
            break;
          }
          const result = await reader.read();
          if (result.done) {
            break;
          }
          append(result.value);
        }
        if (header === void 0) {
          if (buffer.byteLength == 0) {
            controller.close();
            return;
          }
          controller.error(new ConnectError("premature end of stream", Code.DataLoss));
          return;
        }
        const data = buffer.subarray(5, 5 + header.length);
        buffer = buffer.subarray(5 + header.length);
        controller.enqueue({
          flags: header.flags,
          data
        });
      }
    });
  }
  function encodeEnvelope(flags, data) {
    const bytes = new Uint8Array(data.length + 5);
    bytes.set(data, 5);
    const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    v.setUint8(0, flags);
    v.setUint32(1, data.length);
    return bytes;
  }

  // node_modules/@bufbuild/connect/dist/esm/protocol/async-iterable.js
  var __asyncValues = function(o) {
    if (!Symbol.asyncIterator)
      throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
      return this;
    }, i);
    function verb(n) {
      i[n] = o[n] && function(v) {
        return new Promise(function(resolve, reject) {
          v = o[n](v), settle(resolve, reject, v.done, v.value);
        });
      };
    }
    function settle(resolve, reject, d, v) {
      Promise.resolve(v).then(function(v2) {
        resolve({ value: v2, done: d });
      }, reject);
    }
  };
  var __await = function(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
  };
  var __asyncGenerator = function(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator)
      throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
      return this;
    }, i;
    function verb(n) {
      if (g[n])
        i[n] = function(v) {
          return new Promise(function(a, b) {
            q.push([n, v, a, b]) > 1 || resume(n, v);
          });
        };
    }
    function resume(n, v) {
      try {
        step(g[n](v));
      } catch (e) {
        settle(q[0][3], e);
      }
    }
    function step(r) {
      r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
    }
    function fulfill(value) {
      resume("next", value);
    }
    function reject(value) {
      resume("throw", value);
    }
    function settle(f, v) {
      if (f(v), q.shift(), q.length)
        resume(q[0][0], q[0][1]);
    }
  };
  var __asyncDelegator = function(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function(e) {
      throw e;
    }), verb("return"), i[Symbol.iterator] = function() {
      return this;
    }, i;
    function verb(n, f) {
      i[n] = o[n] ? function(v) {
        return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v;
      } : f;
    }
  };
  function createAsyncIterable(items) {
    return __asyncGenerator(this, arguments, function* createAsyncIterable_1() {
      yield __await(yield* __asyncDelegator(__asyncValues(items)));
    });
  }

  // node_modules/@bufbuild/connect/dist/esm/promise-client.js
  var __await2 = function(v) {
    return this instanceof __await2 ? (this.v = v, this) : new __await2(v);
  };
  var __asyncValues2 = function(o) {
    if (!Symbol.asyncIterator)
      throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
      return this;
    }, i);
    function verb(n) {
      i[n] = o[n] && function(v) {
        return new Promise(function(resolve, reject) {
          v = o[n](v), settle(resolve, reject, v.done, v.value);
        });
      };
    }
    function settle(resolve, reject, d, v) {
      Promise.resolve(v).then(function(v2) {
        resolve({ value: v2, done: d });
      }, reject);
    }
  };
  var __asyncDelegator2 = function(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function(e) {
      throw e;
    }), verb("return"), i[Symbol.iterator] = function() {
      return this;
    }, i;
    function verb(n, f) {
      i[n] = o[n] ? function(v) {
        return (p = !p) ? { value: __await2(o[n](v)), done: false } : f ? f(v) : v;
      } : f;
    }
  };
  var __asyncGenerator2 = function(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator)
      throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
      return this;
    }, i;
    function verb(n) {
      if (g[n])
        i[n] = function(v) {
          return new Promise(function(a, b) {
            q.push([n, v, a, b]) > 1 || resume(n, v);
          });
        };
    }
    function resume(n, v) {
      try {
        step(g[n](v));
      } catch (e) {
        settle(q[0][3], e);
      }
    }
    function step(r) {
      r.value instanceof __await2 ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
    }
    function fulfill(value) {
      resume("next", value);
    }
    function reject(value) {
      resume("throw", value);
    }
    function settle(f, v) {
      if (f(v), q.shift(), q.length)
        resume(q[0][0], q[0][1]);
    }
  };
  function createPromiseClient(service, transport) {
    return makeAnyClient(service, (method) => {
      switch (method.kind) {
        case MethodKind.Unary:
          return createUnaryFn(transport, service, method);
        case MethodKind.ServerStreaming:
          return createServerStreamingFn(transport, service, method);
        case MethodKind.ClientStreaming:
          return createClientStreamingFn(transport, service, method);
        case MethodKind.BiDiStreaming:
          return createBiDiStreamingFn(transport, service, method);
        default:
          return null;
      }
    });
  }
  function createUnaryFn(transport, service, method) {
    return async function(input, options) {
      var _a, _b;
      const response = await transport.unary(service, method, options === null || options === void 0 ? void 0 : options.signal, options === null || options === void 0 ? void 0 : options.timeoutMs, options === null || options === void 0 ? void 0 : options.headers, input);
      (_a = options === null || options === void 0 ? void 0 : options.onHeader) === null || _a === void 0 ? void 0 : _a.call(options, response.header);
      (_b = options === null || options === void 0 ? void 0 : options.onTrailer) === null || _b === void 0 ? void 0 : _b.call(options, response.trailer);
      return response.message;
    };
  }
  function createServerStreamingFn(transport, service, method) {
    return function(input, options) {
      var _a, _b;
      return __asyncGenerator2(this, arguments, function* () {
        const inputMessage = input instanceof method.I ? input : new method.I(input);
        const response = yield __await2(transport.stream(service, method, options === null || options === void 0 ? void 0 : options.signal, options === null || options === void 0 ? void 0 : options.timeoutMs, options === null || options === void 0 ? void 0 : options.headers, createAsyncIterable([inputMessage])));
        (_a = options === null || options === void 0 ? void 0 : options.onHeader) === null || _a === void 0 ? void 0 : _a.call(options, response.header);
        yield __await2(yield* __asyncDelegator2(__asyncValues2(response.message)));
        (_b = options === null || options === void 0 ? void 0 : options.onTrailer) === null || _b === void 0 ? void 0 : _b.call(options, response.trailer);
      });
    };
  }
  function createClientStreamingFn(transport, service, method) {
    return async function(request, options) {
      var _a, e_1, _b, _c;
      var _d, _e;
      function input() {
        return __asyncGenerator2(this, arguments, function* input_1() {
          var _a2, e_2, _b2, _c2;
          try {
            for (var _d2 = true, request_1 = __asyncValues2(request), request_1_1; request_1_1 = yield __await2(request_1.next()), _a2 = request_1_1.done, !_a2; ) {
              _c2 = request_1_1.value;
              _d2 = false;
              try {
                const partial = _c2;
                yield yield __await2(partial instanceof method.I ? partial : new method.I(partial));
              } finally {
                _d2 = true;
              }
            }
          } catch (e_2_1) {
            e_2 = { error: e_2_1 };
          } finally {
            try {
              if (!_d2 && !_a2 && (_b2 = request_1.return))
                yield __await2(_b2.call(request_1));
            } finally {
              if (e_2)
                throw e_2.error;
            }
          }
        });
      }
      const response = await transport.stream(service, method, options === null || options === void 0 ? void 0 : options.signal, options === null || options === void 0 ? void 0 : options.timeoutMs, options === null || options === void 0 ? void 0 : options.headers, input());
      (_d = options === null || options === void 0 ? void 0 : options.onHeader) === null || _d === void 0 ? void 0 : _d.call(options, response.header);
      let singleMessage;
      try {
        for (var _f = true, _g = __asyncValues2(response.message), _h; _h = await _g.next(), _a = _h.done, !_a; ) {
          _c = _h.value;
          _f = false;
          try {
            const message = _c;
            singleMessage = message;
          } finally {
            _f = true;
          }
        }
      } catch (e_1_1) {
        e_1 = { error: e_1_1 };
      } finally {
        try {
          if (!_f && !_a && (_b = _g.return))
            await _b.call(_g);
        } finally {
          if (e_1)
            throw e_1.error;
        }
      }
      if (!singleMessage) {
        throw new ConnectError("protocol error: missing response message", Code.Internal);
      }
      (_e = options === null || options === void 0 ? void 0 : options.onTrailer) === null || _e === void 0 ? void 0 : _e.call(options, response.trailer);
      return singleMessage;
    };
  }
  function createBiDiStreamingFn(transport, service, method) {
    return function(request, options) {
      var _a, _b;
      return __asyncGenerator2(this, arguments, function* () {
        function input() {
          return __asyncGenerator2(this, arguments, function* input_2() {
            var _a2, e_3, _b2, _c;
            try {
              for (var _d = true, request_2 = __asyncValues2(request), request_2_1; request_2_1 = yield __await2(request_2.next()), _a2 = request_2_1.done, !_a2; ) {
                _c = request_2_1.value;
                _d = false;
                try {
                  const partial = _c;
                  yield yield __await2(partial instanceof method.I ? partial : new method.I(partial));
                } finally {
                  _d = true;
                }
              }
            } catch (e_3_1) {
              e_3 = { error: e_3_1 };
            } finally {
              try {
                if (!_d && !_a2 && (_b2 = request_2.return))
                  yield __await2(_b2.call(request_2));
              } finally {
                if (e_3)
                  throw e_3.error;
              }
            }
          });
        }
        const response = yield __await2(transport.stream(service, method, options === null || options === void 0 ? void 0 : options.signal, options === null || options === void 0 ? void 0 : options.timeoutMs, options === null || options === void 0 ? void 0 : options.headers, input()));
        (_a = options === null || options === void 0 ? void 0 : options.onHeader) === null || _a === void 0 ? void 0 : _a.call(options, response.header);
        yield __await2(yield* __asyncDelegator2(__asyncValues2(response.message)));
        (_b = options === null || options === void 0 ? void 0 : options.onTrailer) === null || _b === void 0 ? void 0 : _b.call(options, response.trailer);
      });
    };
  }

  // node_modules/@bufbuild/connect/dist/esm/protocol/signals.js
  function createLinkedAbortController(...signals) {
    const controller = new AbortController();
    const sa = signals.filter((s) => s !== void 0).concat(controller.signal);
    for (const signal of sa) {
      if (signal.aborted) {
        onAbort.apply(signal);
        break;
      }
      signal.addEventListener("abort", onAbort);
    }
    function onAbort() {
      if (!controller.signal.aborted) {
        controller.abort(getAbortSignalReason(this));
      }
      for (const signal of sa) {
        signal.removeEventListener("abort", onAbort);
      }
    }
    return controller;
  }
  function createDeadlineSignal(timeoutMs) {
    const controller = new AbortController();
    const listener = () => {
      controller.abort(new ConnectError("the operation timed out", Code.DeadlineExceeded));
    };
    let timeoutId;
    if (timeoutMs !== void 0) {
      if (timeoutMs <= 0)
        listener();
      else
        timeoutId = setTimeout(listener, timeoutMs);
    }
    return {
      signal: controller.signal,
      cleanup: () => clearTimeout(timeoutId)
    };
  }
  function getAbortSignalReason(signal) {
    if (!signal.aborted) {
      return void 0;
    }
    if (signal.reason !== void 0) {
      return signal.reason;
    }
    const e = new Error("This operation was aborted");
    e.name = "AbortError";
    return e;
  }

  // node_modules/@bufbuild/connect/dist/esm/protocol/create-method-url.js
  function createMethodUrl(baseUrl, service, method) {
    const s = typeof service == "string" ? service : service.typeName;
    const m = typeof method == "string" ? method : method.name;
    return baseUrl.toString().replace(/\/?$/, `/${s}/${m}`);
  }

  // node_modules/@bufbuild/connect/dist/esm/protocol/serialization.js
  function createClientMethodSerializers(method, useBinaryFormat, jsonOptions, binaryOptions) {
    function normalize(input2) {
      return input2 instanceof method.I ? input2 : new method.I(input2);
    }
    const input = useBinaryFormat ? createBinarySerialization(method.I, binaryOptions) : createJsonSerialization(method.I, jsonOptions);
    const output = useBinaryFormat ? createBinarySerialization(method.O, binaryOptions) : createJsonSerialization(method.O, jsonOptions);
    return { normalize, parse: output.parse, serialize: input.serialize };
  }
  function createBinarySerialization(messageType, options) {
    return {
      parse(data) {
        try {
          return messageType.fromBinary(data, options);
        } catch (e) {
          const m = e instanceof Error ? e.message : String(e);
          throw new ConnectError(`parse binary: ${m}`, Code.InvalidArgument);
        }
      },
      serialize(data) {
        try {
          return data.toBinary(options);
        } catch (e) {
          const m = e instanceof Error ? e.message : String(e);
          throw new ConnectError(`serialize binary: ${m}`, Code.Internal);
        }
      }
    };
  }
  function createJsonSerialization(messageType, options) {
    var _a, _b;
    const textEncoder = (_a = options === null || options === void 0 ? void 0 : options.textEncoder) !== null && _a !== void 0 ? _a : new TextEncoder();
    const textDecoder = (_b = options === null || options === void 0 ? void 0 : options.textDecoder) !== null && _b !== void 0 ? _b : new TextDecoder();
    return {
      parse(data) {
        try {
          const json = textDecoder.decode(data);
          return messageType.fromJsonString(json, options);
        } catch (e) {
          throw ConnectError.from(e, Code.InvalidArgument);
        }
      },
      serialize(data) {
        try {
          const json = data.toJsonString(options);
          return textEncoder.encode(json);
        } catch (e) {
          throw ConnectError.from(e, Code.Internal);
        }
      }
    };
  }

  // node_modules/@bufbuild/connect/dist/esm/protocol-connect/content-type.js
  var contentTypeUnaryProto = "application/proto";
  var contentTypeUnaryJson = "application/json";
  var contentTypeStreamProto = "application/connect+proto";
  var contentTypeStreamJson = "application/connect+json";

  // node_modules/@bufbuild/connect/dist/esm/protocol-connect/error-json.js
  function errorFromJson(jsonValue, metadata, fallback2) {
    if (metadata) {
      new Headers(metadata).forEach((value, key) => fallback2.metadata.append(key, value));
    }
    if (typeof jsonValue !== "object" || jsonValue == null || Array.isArray(jsonValue) || !("code" in jsonValue) || typeof jsonValue.code !== "string") {
      throw fallback2;
    }
    const code = codeFromString(jsonValue.code);
    if (code === void 0) {
      throw fallback2;
    }
    const message = jsonValue.message;
    if (message != null && typeof message !== "string") {
      throw fallback2;
    }
    const error = new ConnectError(message !== null && message !== void 0 ? message : "", code, metadata);
    if ("details" in jsonValue && Array.isArray(jsonValue.details)) {
      for (const detail of jsonValue.details) {
        if (detail === null || typeof detail != "object" || Array.isArray(detail) || typeof detail.type != "string" || typeof detail.value != "string" || "debug" in detail && typeof detail.debug != "object") {
          throw fallback2;
        }
        try {
          error.details.push({
            type: detail.type,
            value: protoBase64.dec(detail.value),
            debug: detail.debug
          });
        } catch (e) {
          throw fallback2;
        }
      }
    }
    return error;
  }

  // node_modules/@bufbuild/connect/dist/esm/protocol-connect/end-stream.js
  var endStreamFlag = 2;
  function endStreamFromJson(data) {
    const parseErr = new ConnectError("invalid end stream", Code.InvalidArgument);
    let jsonValue;
    try {
      jsonValue = JSON.parse(typeof data == "string" ? data : new TextDecoder().decode(data));
    } catch (e) {
      throw parseErr;
    }
    if (typeof jsonValue != "object" || jsonValue == null || Array.isArray(jsonValue)) {
      throw parseErr;
    }
    const metadata = new Headers();
    if ("metadata" in jsonValue) {
      if (typeof jsonValue.metadata != "object" || jsonValue.metadata == null || Array.isArray(jsonValue.metadata)) {
        throw parseErr;
      }
      for (const [key, values] of Object.entries(jsonValue.metadata)) {
        if (!Array.isArray(values) || values.some((value) => typeof value != "string")) {
          throw parseErr;
        }
        for (const value of values) {
          metadata.append(key, value);
        }
      }
    }
    const error = "error" in jsonValue ? errorFromJson(jsonValue.error, metadata, parseErr) : void 0;
    return { metadata, error };
  }

  // node_modules/@bufbuild/connect/dist/esm/protocol-connect/headers.js
  var headerContentType = "Content-Type";
  var headerUnaryContentLength = "Content-Length";
  var headerUnaryEncoding = "Content-Encoding";
  var headerUnaryAcceptEncoding = "Accept-Encoding";
  var headerTimeout = "Connect-Timeout-Ms";
  var headerProtocolVersion = "Connect-Protocol-Version";

  // node_modules/@bufbuild/connect/dist/esm/protocol-connect/http-status.js
  function codeFromHttpStatus(httpStatus) {
    switch (httpStatus) {
      case 400:
        return Code.InvalidArgument;
      case 401:
        return Code.Unauthenticated;
      case 403:
        return Code.PermissionDenied;
      case 404:
        return Code.Unimplemented;
      case 408:
        return Code.DeadlineExceeded;
      case 409:
        return Code.Aborted;
      case 412:
        return Code.FailedPrecondition;
      case 413:
        return Code.ResourceExhausted;
      case 415:
        return Code.Internal;
      case 429:
        return Code.Unavailable;
      case 431:
        return Code.ResourceExhausted;
      case 502:
        return Code.Unavailable;
      case 503:
        return Code.Unavailable;
      case 504:
        return Code.Unavailable;
      default:
        return Code.Unknown;
    }
  }

  // node_modules/@bufbuild/connect/dist/esm/protocol-connect/trailer-mux.js
  function trailerDemux(header) {
    const h = new Headers(), t = new Headers();
    header.forEach((value, key) => {
      if (key.toLowerCase().startsWith("trailer-")) {
        t.set(key.substring(8), value);
      } else {
        h.set(key, value);
      }
    });
    return [h, t];
  }

  // node_modules/@bufbuild/connect/dist/esm/protocol-connect/version.js
  var protocolVersion = "1";

  // node_modules/@bufbuild/connect/dist/esm/protocol-connect/request-header.js
  function requestHeader(methodKind, useBinaryFormat, timeoutMs, userProvidedHeaders) {
    const result = new Headers(userProvidedHeaders !== null && userProvidedHeaders !== void 0 ? userProvidedHeaders : {});
    if (timeoutMs !== void 0) {
      result.set(headerTimeout, `${timeoutMs}`);
    }
    result.set(headerContentType, methodKind == MethodKind.Unary ? useBinaryFormat ? contentTypeUnaryProto : contentTypeUnaryJson : useBinaryFormat ? contentTypeStreamProto : contentTypeStreamJson);
    result.set(headerProtocolVersion, protocolVersion);
    return result;
  }

  // node_modules/@bufbuild/connect/dist/esm/protocol-connect/validate-response.js
  function validateResponse(methodKind, status, headers) {
    if (status !== 200) {
      const errorFromStatus = new ConnectError(`HTTP ${status}`, codeFromHttpStatus(status), headers);
      if (methodKind == MethodKind.Unary) {
        return { isUnaryError: true, unaryError: errorFromStatus };
      }
      throw errorFromStatus;
    }
    return { isUnaryError: false };
  }

  // node_modules/@bufbuild/connect/dist/esm/protocol-connect/get-request.js
  var contentTypePrefix = "application/";
  function encodeMessageForUrl(message, useBase64) {
    if (useBase64) {
      return protoBase64.enc(message).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } else {
      return encodeURIComponent(new TextDecoder().decode(message));
    }
  }
  function transformConnectPostToGetRequest(request, message, useBase64) {
    let query = `?connect=v${protocolVersion}`;
    const contentType = request.header.get(headerContentType);
    if ((contentType === null || contentType === void 0 ? void 0 : contentType.indexOf(contentTypePrefix)) === 0) {
      query += "&encoding=" + encodeURIComponent(contentType.slice(contentTypePrefix.length));
    }
    const compression = request.header.get(headerUnaryEncoding);
    if (compression !== null && compression !== "identity") {
      query += "&compression=" + encodeURIComponent(compression);
      useBase64 = true;
    }
    if (useBase64) {
      query += "&base64=1";
    }
    query += "&message=" + encodeMessageForUrl(message, useBase64);
    const url = request.url + query;
    const header = new Headers(request.header);
    header.delete(headerProtocolVersion);
    header.delete(headerContentType);
    header.delete(headerUnaryContentLength);
    header.delete(headerUnaryEncoding);
    header.delete(headerUnaryAcceptEncoding);
    return Object.assign(Object.assign({}, request), {
      init: Object.assign(Object.assign({}, request.init), { method: "GET" }),
      url,
      header
    });
  }

  // node_modules/@bufbuild/connect/dist/esm/protocol/run-call.js
  function runUnaryCall(opt) {
    const next = applyInterceptors(opt.next, opt.interceptors);
    const [signal, abort, done] = setupSignal(opt);
    const req = Object.assign(Object.assign({}, opt.req), { signal });
    return next(req).then((res) => {
      done();
      return res;
    }, abort);
  }
  function runStreamingCall(opt) {
    const next = applyInterceptors(opt.next, opt.interceptors);
    const [signal, abort, done] = setupSignal(opt);
    const req = Object.assign(Object.assign({}, opt.req), { signal });
    return next(req).then((res) => {
      return Object.assign(Object.assign({}, res), { message: {
        [Symbol.asyncIterator]() {
          const it = res.message[Symbol.asyncIterator]();
          const w = {
            next() {
              return it.next().then((r) => {
                if (r.done == true) {
                  done();
                }
                return r;
              }, abort);
            }
          };
          if (it.throw !== void 0) {
            w.throw = (e) => it.throw(e);
          }
          if (it.return !== void 0) {
            w.return = (value) => it.return(value);
          }
          return w;
        }
      } });
    }, abort);
  }
  function setupSignal(opt) {
    const { signal, cleanup } = createDeadlineSignal(opt.timeoutMs);
    const controller = createLinkedAbortController(opt.signal, signal);
    return [
      controller.signal,
      function abort(reason) {
        const e = ConnectError.from(signal.aborted ? getAbortSignalReason(signal) : reason);
        controller.abort(e);
        cleanup();
        return Promise.reject(e);
      },
      function done() {
        cleanup();
        controller.abort();
      }
    ];
  }
  function applyInterceptors(next, interceptors) {
    var _a;
    return (_a = interceptors === null || interceptors === void 0 ? void 0 : interceptors.concat().reverse().reduce(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      (n, i) => i(n),
      next
      // eslint-disable-line @typescript-eslint/no-explicit-any
    )) !== null && _a !== void 0 ? _a : next;
  }

  // node_modules/@bufbuild/connect-web/dist/esm/assert-fetch-api.js
  function assertFetchApi() {
    try {
      new Headers();
    } catch (_) {
      throw new Error("connect-web requires the fetch API. Are you running on an old version of Node.js? Node.js is not supported in Connect for Web - please stay tuned for Connect for Node.");
    }
  }

  // node_modules/@bufbuild/connect-web/dist/esm/connect-transport.js
  var __await3 = function(v) {
    return this instanceof __await3 ? (this.v = v, this) : new __await3(v);
  };
  var __asyncGenerator3 = function(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator)
      throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
      return this;
    }, i;
    function verb(n) {
      if (g[n])
        i[n] = function(v) {
          return new Promise(function(a, b) {
            q.push([n, v, a, b]) > 1 || resume(n, v);
          });
        };
    }
    function resume(n, v) {
      try {
        step(g[n](v));
      } catch (e) {
        settle(q[0][3], e);
      }
    }
    function step(r) {
      r.value instanceof __await3 ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
    }
    function fulfill(value) {
      resume("next", value);
    }
    function reject(value) {
      resume("throw", value);
    }
    function settle(f, v) {
      if (f(v), q.shift(), q.length)
        resume(q[0][0], q[0][1]);
    }
  };
  function createConnectTransport(options) {
    var _a, _b;
    assertFetchApi();
    const useBinaryFormat = (_a = options.useBinaryFormat) !== null && _a !== void 0 ? _a : false;
    const fetch = (_b = options.fetch) !== null && _b !== void 0 ? _b : globalThis.fetch;
    return {
      async unary(service, method, signal, timeoutMs, header, message) {
        var _a2;
        const { normalize, serialize, parse } = createClientMethodSerializers(method, useBinaryFormat, options.jsonOptions, options.binaryOptions);
        return await runUnaryCall({
          interceptors: options.interceptors,
          signal,
          timeoutMs,
          req: {
            stream: false,
            service,
            method,
            url: createMethodUrl(options.baseUrl, service, method),
            init: {
              method: "POST",
              credentials: (_a2 = options.credentials) !== null && _a2 !== void 0 ? _a2 : "same-origin",
              redirect: "error",
              mode: "cors"
            },
            header: requestHeader(method.kind, useBinaryFormat, timeoutMs, header),
            message: normalize(message)
          },
          next: async (req) => {
            const useGet = options.useHttpGet === true && method.idempotency === MethodIdempotency.NoSideEffects;
            let body = null;
            if (useGet) {
              req = transformConnectPostToGetRequest(req, serialize(req.message), useBinaryFormat);
            } else {
              body = serialize(req.message);
            }
            const response = await fetch(req.url, Object.assign(Object.assign({}, req.init), { headers: req.header, signal: req.signal, body }));
            const { isUnaryError, unaryError } = validateResponse(method.kind, response.status, response.headers);
            if (isUnaryError) {
              throw errorFromJson(await response.json(), appendHeaders(...trailerDemux(response.headers)), unaryError);
            }
            const [demuxedHeader, demuxedTrailer] = trailerDemux(response.headers);
            return {
              stream: false,
              service,
              method,
              header: demuxedHeader,
              message: parse(new Uint8Array(await response.arrayBuffer())),
              trailer: demuxedTrailer
            };
          }
        });
      },
      async stream(service, method, signal, timeoutMs, header, input) {
        var _a2;
        const { serialize, parse } = createClientMethodSerializers(method, useBinaryFormat, options.jsonOptions, options.binaryOptions);
        function parseResponseBody(body, trailerTarget) {
          return __asyncGenerator3(this, arguments, function* parseResponseBody_1() {
            const reader = createEnvelopeReadableStream(body).getReader();
            let endStreamReceived = false;
            for (; ; ) {
              const result = yield __await3(reader.read());
              if (result.done) {
                break;
              }
              const { flags, data } = result.value;
              if ((flags & endStreamFlag) === endStreamFlag) {
                endStreamReceived = true;
                const endStream = endStreamFromJson(data);
                if (endStream.error) {
                  throw endStream.error;
                }
                endStream.metadata.forEach((value, key) => trailerTarget.set(key, value));
                continue;
              }
              yield yield __await3(parse(data));
            }
            if (!endStreamReceived) {
              throw "missing EndStreamResponse";
            }
          });
        }
        async function createRequestBody(input2) {
          if (method.kind != MethodKind.ServerStreaming) {
            throw "The fetch API does not support streaming request bodies";
          }
          const r = await input2[Symbol.asyncIterator]().next();
          if (r.done == true) {
            throw "missing request message";
          }
          return encodeEnvelope(0, serialize(r.value));
        }
        return await runStreamingCall({
          interceptors: options.interceptors,
          timeoutMs,
          signal,
          req: {
            stream: true,
            service,
            method,
            url: createMethodUrl(options.baseUrl, service, method),
            init: {
              method: "POST",
              credentials: (_a2 = options.credentials) !== null && _a2 !== void 0 ? _a2 : "same-origin",
              redirect: "error",
              mode: "cors"
            },
            header: requestHeader(method.kind, useBinaryFormat, timeoutMs, header),
            message: input
          },
          next: async (req) => {
            const fRes = await fetch(req.url, Object.assign(Object.assign({}, req.init), { headers: req.header, signal: req.signal, body: await createRequestBody(req.message) }));
            validateResponse(method.kind, fRes.status, fRes.headers);
            if (fRes.body === null) {
              throw "missing response body";
            }
            const trailer = new Headers();
            const res = Object.assign(Object.assign({}, req), { header: fRes.headers, trailer, message: parseResponseBody(fRes.body, trailer) });
            return res;
          }
        });
      }
    };
  }

  // gen/proto/sf/events/v1/events_pb.js
  var EventsRequest = proto3.makeMessageType(
    "sf.events.v1.EventsRequest",
    () => [
      { no: 1, name: "includes", kind: "scalar", T: 9, repeated: true },
      { no: 2, name: "excludes", kind: "scalar", T: 9, repeated: true }
    ]
  );
  var EventsResponse = proto3.makeMessageType(
    "sf.events.v1.EventsResponse",
    () => [
      {
        no: 1,
        name: "name",
        kind: "scalar",
        T: 9
        /* ScalarType.STRING */
      },
      {
        no: 2,
        name: "payload",
        kind: "scalar",
        T: 12
        /* ScalarType.BYTES */
      }
    ]
  );

  // gen/proto/sf/events/v1/events_connect.js
  var EventService = {
    typeName: "sf.events.v1.EventService",
    methods: {
      /**
       * @generated from rpc sf.events.v1.EventService.Events
       */
      events: {
        name: "Events",
        I: EventsRequest,
        O: EventsResponse,
        kind: MethodKind.ServerStreaming
      }
    }
  };
