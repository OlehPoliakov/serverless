import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { hashPassword } from "../common/password";
import { signToken } from "../common/jwt";
import { api } from "../common/api";
import {AdminRegisterInput} from '../common/sdk'
import { verifyHasura } from "../common/verifyHasura";


const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const { body, headers } = event;

  try {
    verifyHasura(headers);
  } catch (error) {
    return JSON.parse(error.message);
  }

  const input: AdminRegisterInput = JSON.parse(body!).input.admin;
  console.log('body ===>', body)

  const password = hashPassword(input.password)

  const data = await api.InsertAdmin(
    {
      username: input.username,
      password,
    },
    {'x-hasura-admin-secret': 'myadminsecretkey',}
  )

  // console.log('data', data)

  const accessToken = signToken(data.insert_admin_one?.id)

  // console.log('accessToken', accessToken)  

  return {
    statusCode: 200,
    body: JSON.stringify({ accessToken }),
  };
};

export { handler };
