function parse_bms(str) {
	let mat = [];
	let col = [];
	let num = -1;
	let reading = false;
	for (let i = 0; i < str.length; i++) {
		let c = str[i];
		switch (c) {
			case '(': reading = true; num = 0; col = []; break;
			case ')': reading = false; col.push(num); while (col[col.length-1] == 0) col.pop(); mat.push(col); break;
			case ',': col.push(num); num = 0; break;
			default:
				let cc = c.charCodeAt(0);
				if (reading && cc >= 48 && cc <= 57) num = num * 10 + cc - 48;
		}
	}
	let max = 0;
	for (let i = 0; i < mat.length; i++)
		if (max < mat[i].length) max = mat[i].length;

	for (let i = 0; i < mat.length; i++) {
		let arr = new Array(max - mat[i].length).fill(0);
		mat[i] = mat[i].concat(arr);
	}
	return mat;
}

function get_bad_roots(mat) {
	let bad_roots = new Array(mat.length);
	for (let i = 0; i < mat.length; i++)
		bad_roots[i] = new Array(mat[0].length).fill(-2);

	for (let i = 0; i < mat[0].length; i++) {
		for (let j = mat.length-1; j >= 0; j--) {
			if (mat[j][i] == 0) bad_roots[j][i] = -1;
			else if (i == 0) {
				let br = j;
				if (bad_roots[j][i] == -2) {
					while (mat[--br][i] >= mat[j][i]);
					bad_roots[j][i] = br;
				}
			} else {
				let br = j;
				if (bad_roots[j][i] == -2) {
					do br = bad_roots[br][i - 1];
					while (mat[br][i] >= mat[j][i]);
					bad_roots[j][i] = br;
				}
			}
		}
	}
	return bad_roots;
}

function tree() {
	let bmsstr = document.getElementById("bmsmat").value;
	let bmsmat = parse_bms(bmsstr);

	let max_heights = [];
	let start_heights = [];
	for (let i = 0; i < bmsmat[0].length; i++) {
		let max = 0;
		for (let j = 0; j < bmsmat.length; j++)
			if (max < bmsmat[j][i]) max = bmsmat[j][i];
		max_heights[i] = max + 2;
	}
	start_heights[0] = max_heights[0];
	for (let i = 1; i < max_heights.length; i++)
		start_heights[i] = max_heights[i] + start_heights[i-1];
	console.log(start_heights);

	let tile_height = max_heights.reduce((a, b) => a + b);
	let tile_width = bmsmat.length + 1;

	let bad_roots = get_bad_roots(bmsmat);
	console.log(bad_roots);

	let canvas = document.getElementById("canvas");
	let ctx = canvas.getContext("2d");
	let width = canvas.width, height = canvas.height;

	let bms_to_screen = (x, y) => [
		100 + (width - 200) / (tile_width - 1) * x,
		100 + (height - 200) / (tile_height - 1) * y
	]
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, width, height);
	ctx.fillStyle = "#FFF";
	ctx.beginPath();
	for (let i = 0; i < bmsmat[0].length; i++) {
		let [ rx, ry ] = bms_to_screen(0, start_heights[i] - 1);
		// draws an x trust me
		ctx.moveTo(rx-7, ry+10); ctx.lineTo(rx, ry+3); ctx.lineTo(rx+7, ry+10); ctx.lineTo(rx+10, ry+7); ctx.lineTo(rx+3, ry); ctx.lineTo(rx+10, ry-7); ctx.lineTo(rx+7, ry-10); ctx.lineTo(rx, ry-3); ctx.lineTo(rx-7, ry-10); ctx.lineTo(rx-10, ry-7); ctx.lineTo(rx-3, ry); ctx.lineTo(rx-10, ry+7); ctx.lineTo(rx-7, ry+10);
		// ctx.arc(rx, ry, 10, 0, 2*Math.PI);
		for (let j = 0; j < bmsmat.length; j++) {
			let [ x, y ] = bms_to_screen(j + 1, start_heights[i] - bmsmat[j][i] - 2);
			ctx.moveTo(x, y);
			ctx.arc(x, y, 10, 0, 2*Math.PI);
			// console.log(x, y);
		}
	}
	ctx.fill();
	ctx.strokeStyle = "#FFF";
	ctx.lineWidth = 3;
	ctx.beginPath();
	for (let i = 0; i < bmsmat[0].length; i++) {
		// ctx.arc(rx, ry, 10, 0, 2*Math.PI);
		for (let j = 0; j < bmsmat.length; j++) {
			let idx = bad_roots[j][i];
			let [ x, y ] = bms_to_screen(j + 1, start_heights[i] - bmsmat[j][i] - 2);
			let idy = idx != -1 ? bmsmat[idx][i] : -1;
			let [ bx, by ] = bms_to_screen(idx + 1, start_heights[i] - idy - 2);
			let rx = x - bx;
			let ry = by - y;
			ctx.moveTo(x, y);
			ctx.ellipse(bx, y, rx, ry, 0, 0, Math.PI / 2);
			// console.log(x, y);
		}
	}
	ctx.stroke();
}