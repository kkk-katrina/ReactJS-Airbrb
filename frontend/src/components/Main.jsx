import React, { useContext } from 'react';
import { Button } from 'tdesign-react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import config from '../config.json';
import context from '../context/userInfo';

export default function Page () {
  const { userInfo, setUserInfo } = useContext(context);
  const navTo = useNavigate();
  return (
    <div className='mainBg'>
      <div className='mainCenter'>
        <div className='left'>
          <div className='leftHead'>
            <h3
              className='email'
              style={{
                marginBottom: 15,
                fontSize: 14,
                padding: '0 10px',
                wordBreak: 'break-all',
              }}
            >
              {userInfo?.email}
            </h3>
            <div
              style={{
                marginBottom: 15,
              }}
            >
              {userInfo && (
                <Button
                  onClick={() => {
                    fetch(
                      `http://localhost:${
                        config.BACKEND_PORT
                      }/user/auth/logout`,
                      {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: 'Bearer ' + userInfo.token,
                        },
                      }
                    )
                      .then((response) => {
                        return response.json();
                      })
                      .then(() => {
                        setUserInfo(null);
                        navTo('/login');
                      });
                  }}
                  size='small'
                  theme='danger'
                  variant='outline'
                >
                  logout
                </Button>
              )}
              {!userInfo && (
                <Button
                  onClick={() => {
                    navTo('/login');
                  }}
                  size='small'
                  theme='primary'
                  variant='outline'
                >
                  login
                </Button>
              )}
            </div>
          </div>
          <div className='leftBottom'>
            <Link
              to='/'
              style={{
                margin: '20px 0',
              }}
            >
              Home
            </Link>
            <Link to='/my'>My</Link>
          </div>
        </div>

        <div className='right'>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
