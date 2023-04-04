import React, { useContext } from 'react';
import { Form, Input, Button, MessagePlugin, Card } from 'tdesign-react';
import config from '../config.json';
import context from '../context/userInfo';
import { Link, useNavigate } from 'react-router-dom';
import { MailIcon, LockOnIcon, UserIcon } from 'tdesign-icons-react';
const { FormItem } = Form;
export default function Page () {
  const [form] = Form.useForm();
  const { setUserInfo } = useContext(context);
  const navTo = useNavigate();
  const onSubmit = (e) => {
    if (e.validateResult === true) {
      const formVal = form.getFieldsValue?.(true);
      if (formVal.password !== formVal.confirmPassword) {
        MessagePlugin.error('The passwords are inconsistent twice');
        return;
      }
      fetch(`http://localhost:${config.BACKEND_PORT}/user/auth/register`, {
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
          ...formVal
        })
        setUserInfo({
          token: jsonRes.token,
          ...formVal
        });
        navTo('/');
        MessagePlugin.success('Successfully register in');
      });
    }
  };
  const rules = {
    name: [
      {
        required: true,
        message: 'Please enter your name',
        type: 'error',
      },
    ],
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
    confirmPassword: [
      { required: true, message: 'Please input Confirm password', type: 'error' },
    ],
  };
  return (
    <div className='login'>
      <Card
        title='Register'
        actions={<Link to='/login'>have an account, go to login</Link>}
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
          <FormItem name='name'>
            <Input
              clearable={true}
              prefixIcon={<UserIcon />}
              placeholder='Please enter your name'
            />
          </FormItem>
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
          <FormItem name='confirmPassword'>
            <Input
              type='password'
              prefixIcon={<LockOnIcon />}
              clearable={true}
              placeholder='Please input Confirm password'
            />
          </FormItem>
          <FormItem>
            <Button theme='primary' type='submit' block>
              Register
            </Button>
          </FormItem>
        </Form>
      </Card>
    </div>
  );
}
