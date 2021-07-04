const fs = require('fs');
const yaml = require('js-yaml');
const axios = require('axios');

const DOCS_DIR = `${__dirname}/../docs/`;
const OUTPUT_DIR = `checks/`;
const ASSETS_DIR = `${__dirname}/../assets/`;

const CHECKLIST_FILENAME = `${__dirname}/../urllist.yaml`;

main();

async function main() {
	const [success, failure] = getSvgs();
	const urllist = yaml.load(fs.readFileSync(CHECKLIST_FILENAME, 'utf8'));
	const checklist = [];

	for (const item of urllist) {
		let url = item.url;
		const flag = await checkUrl(url, item.params, item.type);
		console.log(`check : ${url} => ${(flag ? "〇" : "×")}`);
		const svg = flag ? success : failure;
		const dir_name = item.name || encodeURIComponent(url);
		const dir = `${DOCS_DIR}${OUTPUT_DIR}${dir_name}/`;
		!fs.existsSync(dir) && fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(dir+"check.svg", svg);
		const _date = new Date().toString();
		fs.writeFileSync(dir+"update.txt", _date);
		checklist.push({
			name: dir_name,
			url: url,
			requestUrl: getRequestUrl(url, item.params),
			updatedAt: _date,
			status: flag,
			statusImg: `${OUTPUT_DIR}${dir_name}/check.svg`,
		});
	}
	fs.writeFileSync(
		DOCS_DIR+"status.js", 
		`var data = ${JSON.stringify(checklist)};`
	);
}

async function checkUrl(url, params, type) {
	params = params || [];
	type = type || "GET";
	console.log(url);
	let flag = false;
	try {
		let res;
		if (type.match(/get/i)) {
			res = await axios.get(url, {
				params
			});
		} else {
			res = await axios.post(url, {
				...params
			}, {
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			});
		}
		flag = true;
	} catch (e) {
		console.error(e.response ? e.response.status : e.errno);
	}
	return flag;
}

function getSvgs() {
	const success = fs.readFileSync(ASSETS_DIR+"success.svg", "UTF8");
	const failure = fs.readFileSync(ASSETS_DIR+"failure.svg", "UTF8");
	return [success, failure];
}

function getRequestUrl(url, params) {
	if (!params) return url;
	return axios.create().getUri({url, params});
}