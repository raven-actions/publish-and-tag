import { Toolkit, createLogger } from 'actions-toolkit'

export function generateToolkit(): Toolkit {
  const tools = new Toolkit({
    logger: createLogger({ disabled: true })
  })

  return tools
}
