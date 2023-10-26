let jobs = []
async function test() {
const response = await fetch('https://boards-api.greenhouse.io/v1/boards/harnessinc/jobs')
const data = await response.json()
console.log(data)
jobs = data.jobs
}
test()
const sampleText = 'hello world!'
