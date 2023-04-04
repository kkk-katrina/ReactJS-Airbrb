import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Main from './components/Main';
import My from './components/My';
import All from './components/All';
import Detail from './components/Detail';
import CreateOrEdit from './components/CreateOrEdit';
import Records from './components/Records';
import userInfoContext from './context/userInfo';
import './App.css';

function App () {
  const [userInfo, setUserInfo] = useState(null);
  useEffect(() => {
    let localUserInfo = window.localStorage.userInfo;
    if (localUserInfo || window.userInfo) {
      localUserInfo = window.userInfo || JSON.parse(localUserInfo);
    } else {
      localUserInfo = null;
    }
    setUserInfo(localUserInfo);
  }, []);

  return (
    <div>
      <userInfoContext.Provider value={{
        userInfo,
        setUserInfo
      }}>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/' element={<Main />}>
            <Route index element={<All />} />
            <Route path='my' element={<My />} />
            <Route path='createOrEdit/:listingId' element={<CreateOrEdit />} />
            <Route path='detail/:listingId/:date' element={<Detail />} />
            <Route path='listingRecords/:listingId' element={<Records />} />
          </Route>
        </Routes>
      </userInfoContext.Provider>
    </div>
  );
}

export default App;
