import React, { useContext } from 'react';
import { Form, Input, Button, MessagePlugin, Card } from 'tdesign-react';
import config from '../config.json';
import context from '../context/userInfo';
import { Link, useNavigate } from 'react-router-dom';
import { MailIcon, LockOnIcon } from 'tdesign-icons-react';
const { FormItem } = Form;
export default function Page () {
  const [form] = Form.useForm();
  const navTo = useNavigate();
  const { setUserInfo } = useContext(context);
  const onSubmit = (e) => {
    if (e.validateResult === true) {
      const formVal = form.getFieldsValue?.(true);
      fetch(`http://localhost:${config.BACKEND_PORT}/user/auth/login`, {
        method: 'POST',
        body: JSON.stringify(formVal),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(async (response) => {
        const jsonRes = await response.json();
        if (response.status !== 200) {
          MessagePlugin.error(jsonRes.error);
          return;
        }
        window.localStorage.userInfo = JSON.stringify({
          token: jsonRes.token,
          ...formVal,
        });
        setUserInfo({
          token: jsonRes.token,
          ...formVal,
        });
        navTo('/');
        MessagePlugin.success('Successfully logged in');
      });
    }
  };
  const rules = {
    email: [
      {
        required: true,
        message: 'Please enter your email address',
        type: 'error',
      },
    ],
    password: [
      { required: true, message: 'Please input a password', type: 'error' },
    ],
  };
  return (
    <div className='login'>
      <Card
        title='Login'
        actions={<Link to='/register'>No account, go to register</Link>}
        bordered
        style={{ width: '90%', maxWidth: 500 }}
      >
        <Form
          statusIcon={true}
          onSubmit={onSubmit}
          colon={true}
          labelWidth={0}
          form={form}
          rules={rules}
        >
          <FormItem name='email'>
            <Input
              clearable={true}
              prefixIcon={<MailIcon />}
              placeholder='Please enter your email address'
            />
          </FormItem>
          <FormItem name='password'>
            <Input
              type='password'
              prefixIcon={<LockOnIcon />}
              clearable={true}
              placeholder='Please input a password'
            />
          </FormItem>
          <FormItem>
            <Button theme='primary' type='submit' block>
              Login
            </Button>
          </FormItem>
        </Form>
      </Card>
    </div>
  );
}
