const Ip2Region = require("ts-ip2region2");

require("twikoo-func/utils/lib").getIpToRegion = () => {
  return {
    create() {
      const searcher = new Ip2Region.Ip2Region();
      return {
        btreeSearchSync(ipStr) {
          const result = searcher.search('ipStr');
          let parts = result.region.split("|");
          if (parts.length === 4) {
            parts.splice(1, 0, "0"); // 在第二位置插入区域占位符
          }
          const fullRegion = parts.join("|");
          return { region: fullRegion }
        },
      };
    },
  };
};
const twikoo = require("twikoo-vercel");
/**
 * Netlify 函数兼容 Vercel 函数实现
 * 复用 Twikoo Vercel 函数代码
 * Netlify functions doc:
 * https://docs.netlify.com/functions/create/?fn-language=js
 */
exports.handler = async function (event, context) {
  process.env.VERCEL_URL = event.rawUrl.replace(/^https?:\/\//, "");
  process.env.TWIKOO_IP_HEADERS = JSON.stringify([
    "headers.cf-connecting-ip",
    "headers.x-nf-client-connection-ip",
  ]);
  const result = {
    statusCode: 204,
    headers: {},
    body: "",
  };
  const request = {
    method: event.httpMethod,
    headers: event.headers,
    body: {},
  };
  try {
    request.body = JSON.parse(event.body);
  } catch (e) {}
  const response = {
    status: function (code) {
      result.statusCode = code;
      return this;
    },
    json: function (json) {
      result.headers["Content-Type"] = "application/json";
      result.body = JSON.stringify(json);
      return this;
    },
    end: function () {
      return this;
    },
    setHeader: function (k, v) {
      result.headers[k] = v;
      return this;
    },
  };
  await twikoo(request, response);
  return result;
};
