const location = [[10.856801472746513, 106.78506564549127],
[10.852303979858057, 106.77188405474169], [10.852388275518555, 106.7538596116085],
[10.852303979858057, 106.77188405474169], [10.822356442601324, 106.75851592647223],
[10.81498016702918, 106.75671879467917], [10.802449457350587, 106.71532164255343],
[10.822356442601324, 106.75851592647223], [10.829228564644115, 106.72216775298172],
[10.84174717607473, 106.74371125488322], [10.829228564644115, 106.72216775298172],
[10.802449457350587, 106.71532164255343]]


const location2 = [[106.78506564549127, 10.856801472746513],
[106.77188405474169, 10.852303979858057], [106.7538596116085, 10.852388275518555],
[106.77188405474169, 10.852303979858057], [106.75851592647223, 10.822356442601324],
[106.75671879467917, 10.81498016702918], [106.71532164255343, 10.802449457350587],
[106.75851592647223, 10.822356442601324], [106.72216775298172, 10.829228564644115],
[106.74371125488322, 10.84174717607473], [106.72216775298172, 10.829228564644115],
[106.71532164255343, 10.802449457350587]]

const matrixTime = [
    [0, 196.7, 321.46, 196.7, 312.01, 360.14, 752.84, 312.01, 632.19, 522.47, 632.19, 752.84],
    [196.7, 0, 297.96, 0, 326.82, 374.95, 767.65, 326.82, 605.33, 495.61, 605.33, 767.65],
    [321.46, 297.96, 0, 297.96, 335.12, 382.89, 742.15, 335.12, 382.98, 263.35, 382.98, 742.15],
    [196.7, 0, 297.96, 0, 326.82, 374.95, 767.65, 326.82, 605.33, 495.61, 605.33, 767.65],
    [348.21, 348.21, 336.5, 348.21, 0, 56.41, 451.59, 0, 459.48, 349.76, 459.48, 451.59],
    [392.34, 392.34, 380.63, 392.34, 56.41, 0, 470.51, 56.41, 503.61, 393.89, 503.61, 470.51],
    [839.75, 839.75, 625.85, 839.75, 544.2, 487.78, 0, 544.2, 250.53, 547.1, 250.53, 0],
    [348.21, 348.21, 336.5, 348.21, 0, 56.41, 451.59, 0, 459.48, 349.76, 459.48, 451.59],
    [633.77, 606.91, 385.53, 606.91, 471.8, 515.92, 369.03, 471.8, 0, 306.78, 0, 369.03],
    [522.16, 495.3, 273.92, 495.3, 360.19, 404.32, 652.16, 360.19, 292.17, 0, 292.17, 652.16],
    [633.77, 606.91, 385.53, 606.91, 471.8, 515.92, 369.03, 471.8, 0, 306.78, 0, 369.03],
    [839.75, 839.75, 625.85, 839.75, 544.2, 487.78, 0, 544.2, 250.53, 547.1, 250.53, 0]
]

const matrix = [
    [0, 2270.46, 4672.21, 2270.46, 4977.6, 5837.89, 11553.04, 4977.6, 8561.25, 6337.32, 8561.25, 11553.04],
    [2270.46, 0, 3529.24, 0, 4412.8, 5273.09, 10988.24, 4412.8, 7328.61, 5104.68, 7328.61, 10988.24],
    [4672.21, 3529.24, 0, 3529.24, 4480.24, 5251.95, 9012.14, 4480.24, 4847.27, 2089.14, 4847.27, 9012.14],
    [2270.46, 0, 3529.24, 0, 4412.8, 5273.09, 10988.24, 4412.8, 7328.61, 5104.68, 7328.61, 10988.24],
    [5186.35, 4529.42, 4401.97, 4529.42, 0, 863.45, 6620.25, 0, 6323.78, 4099.85, 6323.78, 6620.25],
    [5998.61, 5341.68, 5214.23, 5341.68, 863.45, 0, 6846.01, 863.45, 7136.04, 4912.11, 7136.04, 6846.01],
    [12505.99, 11849.06, 8767.18, 11849.06, 8175.62, 7312.18, 0, 8175.62, 4075.79, 7360.97, 4075.79, 0],
    [5186.35, 4529.42, 4401.97, 4529.42, 0, 863.45, 6620.25, 0, 6323.78, 4099.85, 6323.78, 6620.25],
    [8567.54, 7334.9, 4857.13, 7334.9, 6348.88, 7161.14, 4240.58, 6348.88, 0, 3450.92, 0, 4240.58],
    [6338.88, 5106.24, 2628.47, 5106.24, 4120.23, 4932.49, 7540.04, 4120.23, 3343.2, 0, 3343.2, 7540.04],
    [8567.54, 7334.9, 4857.13, 7334.9, 6348.88, 7161.14, 4240.58, 6348.88, 0, 3450.92, 0, 4240.58],
    [12505.99, 11849.06, 8767.18, 11849.06, 8175.62, 7312.18, 0, 8175.62, 4075.79, 7360.97, 4075.79, 0]
]

const price = [20000, 30000, 20000, 45000, 50000]

//const distance = [matrix[1][2], matrix[3][4], matrix[5][6], matrix[7][8], matrix[9][10]]
const length = matrix[0].length;
const size = (matrix[0].length - 2) / 2;

const distance = [];
for (let i = 1; i <= size; i++) {
    distance[i - 1] = [matrix[i * 2 - 1][i * 2], price[i - 1]];
}

const raw = matrix[0][length - 1];
let requestPair = [];
let maxProfit = 0;


for (let i = 1; i <= size; i++) {
    let min = 999999999;
    for (let j = 1; j <= size; j++) {
        if (i == j) {
            continue;
        }
        const cost = distance[i - 1][0] + distance[j - 1][0] + matrix[0][i * 2 - 1] + matrix[j * 2][length - 1] + matrix[i * 2][j * 2 - 1];
        const amount = distance[i - 1][1] + distance[j - 1][1];
        if (cost <= min) {
            min = cost;
            if (maxProfit < amount / (cost - raw))
                maxProfit = amount / (cost - raw);
            //requestPair[i - 1] = [i, j, cost - raw, amount, amount / (cost - raw)];
            requestPair[i - 1] = { ida: i, idb: j, cost: cost - raw, price: amount, hight: amount / (cost - raw) };
        }
    }
}

for (let i = 1; i <= size; i++) {
    let min = 999999999;
    const cost = distance[i - 1][0] + matrix[0][i * 2 - 1] + matrix[i * 2][length - 1];
    const amount = distance[i - 1][1];
    if (cost <= min) {
        min = cost;
        if (maxProfit < amount / (cost - raw))
            maxProfit = amount / (cost - raw);
        // requestPair[i - 1 + size] = [i, 0, cost - raw, amount, amount / (cost - raw)];
        requestPair[i - 1 + size] = { ida: i, idb: 0, cost: cost - raw, price: amount, hight: amount / (cost - raw) };
    }
}

// requestPair.map(r => r[4] = r[4] / maxProfit * 100);
// requestPair.sort((a, b) => {
//     if (a[4] == b[4])
//         return a[2] - b[2];
//     else
//         return b[4] - a[4];
// });

requestPair.map(r => r.hight = r.hight / maxProfit * 100);
requestPair.sort((a, b) => {
    if (a.hight == b.hight)
        return a.cost - b.cost;
    else
        return b.hight - a.hight;
});

//.map(r => [...r, r[4] / maxProfit * 100])

// let effective = [];
// for (let i = 0; i < size; i++) {
//     effective[i] = requestPair[i][4] / maxProfit * 100;
// }



// console.log(distance);
// console.log("--------------------------------------");
console.log(raw);
console.log("--------------------------------------");
console.log(requestPair);
// console.log("--------------------------------------");
// console.log(effective);

