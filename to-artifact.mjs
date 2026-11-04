// Turns dist/index.html (from `npm run build:single`) into a page fragment for publishing.
import { readFileSync, writeFileSync } from "node:fs";
const [, , src = "dist/index.html", out = "dist/artifact.html"] = process.argv;
const html = readFileSync(src, "utf8");
const headEnd = html.lastIndexOf("</head>");
const sStart = html.indexOf('<script type="module"');
const sEnd = html.lastIndexOf("</script>", headEnd) + "</script>".length;
const pre = html.slice(0, sStart);                 // title + font links
const script = html.slice(sStart, sEnd);
const style = html.slice(sEnd, headEnd).trim();    // inlined CSS
const title = pre.match(/<title>[\s\S]*?<\/title>/)[0];
const links = [...pre.matchAll(/<link [^>]*>/g)].map((m) => m[0]).join("\n");
let page = `${title}\n<meta name="claude:viewport-fit-sides" content="cover">\n${links}\n${style}\n<div id="root"></div>\n${script}\n`;
page = page.replace(/�/g, "\\uFFFD");
writeFileSync(out, page);
console.log("wrote", out, page.length, "chars");
