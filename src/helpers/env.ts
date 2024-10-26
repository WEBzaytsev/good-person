import * as dotenv from 'dotenv'
import { cleanEnv, str, port } from 'envalid'
import { cwd } from 'process'
import { resolve } from 'path'

dotenv.config({ path: resolve(cwd(), '.env') })

// eslint-disable-next-line node/no-process-env
export default cleanEnv(process.env, {
  TOKEN: str(),
  DB_HOST: str(),
  DB_PORT: port({ default: 3306 }),
  DB_NAME: str(),
  DB_USER: str(),
  DB_PASSWORD: str(),
})
