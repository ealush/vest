function enforce() {
  const proxy = new Proxy({}, {
    get(target: any, rule: string | symbol, receiver: any) { }
  })
}

function runRule() {

}