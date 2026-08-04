/**
 * Netlify 函数兼容 Vercel 函数实现
 * 复用 Twikoo Vercel 函数代码
 * Netlify functions doc:
 * https://docs.netlify.com/functions/create/?fn-language=js
 */
exports.handler = async function (event, context) {
  const Ip2Region = require("ts-ip2region2");
  console.error("111111111", require("twikoo-func/utils").getIpRegion);
  require("twikoo-func/utils").getIpRegion = ({ ip, detail = false }) => {
    try {
      const isIPv6 = ip.includes(":");
      const searcher = new Ip2Region.Ip2Region({
        ipVersion: isIPv6 ? "v6" : "v4",
      });
      const result = searcher.search(ip);
      return result.region
        .split("|")
        .filter((part) => part !== "0")
        .filter((part, index, arr) => index === 0 || part !== arr[index - 1])
        .slice(0, 3)
        .join("-");
    } catch (e) {
      console.error(e);
      return "";
    }
  };
  console.error("222222", require("twikoo-func/utils").getIpRegion);

  const twikoo = require("twikoo-vercel");

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
