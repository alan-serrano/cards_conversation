export function randomBetweenNumber(min, max) {
    return Math.floor( (max - min + 1) * Math.random() + min )
}

export function randomElementArray(arr) {
    const randomId = randomBetweenNumber(0, arr.length - 1)
    return arr[ randomId ]
}

export function randomIdArray(arr) {
    const randomId = randomBetweenNumber(0, arr.length - 1)
    return randomId;
}