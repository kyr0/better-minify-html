const { promises: fs } = require("node:fs");
const childProcess = require("node:child_process");
const path = require("node:path");

const tests = {
  Amazon: "https://www.amazon.com/",
  BBC: "https://www.bbc.co.uk/",
  Bootstrap: "https://getbootstrap.com/docs/3.4/css/",
  Bing: "https://www.bing.com/",
  "Coding Horror": "https://blog.codinghorror.com/",
  "ECMA-262": "https://www.ecma-international.org/ecma-262/10.0/index.html",
  Google: "https://www.google.com/",
  "Hacker News": "https://news.ycombinator.com/",
  "NY Times": "https://www.nytimes.com/",
  Reddit: "https://www.reddit.com/",
  "Stack Overflow": "https://www.stackoverflow.com/",
  Twitter: "https://twitter.com/",
  Wikipedia: "https://en.wikipedia.org/wiki/Soil",
};

const fetchTest = (name, url) =>
  new Promise((resolve, reject) => {
    // Use curl to follow redirects without needing a Node.js library.
    childProcess.execFile(
      "curl",
      [
        "-H",
        "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; rv:71.0) Gecko/20100101 Firefox/71.0",
        "-H",
        "Accept: */*",
        "-fLSs",
        url,
      ],
      (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }
        if (stderr) {
          return reject(new Error(`stderr: ${stderr}`));
        }
        resolve([name, stdout]);
      }
    );
  });

(async () => {
  const existing = await fs.readdir(path.join(__dirname, "tests"));
  await Promise.all(
    existing.map((e) => fs.unlink(path.join(__dirname, "tests", e)))
  );

  // Format after fetching as formatting is synchronous and can take so long that connections get dropped by server due to inactivity.
  for (const [name, html] of await Promise.all(
    Object.entries(tests).map(([name, url]) => fetchTest(name, url))
  )) {
    // Apply some fixes to HTML.
    const fixed = html
      // Fix early termination of conditional comment in Amazon.
      .replace("--></style>\n<![endif]-->", "</style>\n<![endif]-->")
      // Fix closing of void tag in Amazon.
      .replace(/><\/hr>/g, "/>")
      // Fix extra '</div>' in BBC.
      .replace(
        "</a></span></small></div></div></div></footer>",
        "</a></span></small></div></div></footer>"
      )
      // Fix broken attribute value in Stack Overflow.
      .replace('height=151"', 'height="151"');
    await fs.writeFile(path.join(__dirname, "tests", name), fixed);
  }
})().catch(console.error);
