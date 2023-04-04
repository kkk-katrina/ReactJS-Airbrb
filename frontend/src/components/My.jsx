import React, { useContext, useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Dropdown,
  Comment,
  Rate,
  Drawer,
  Form,
  DateRangePicker,
  MessagePlugin,
} from 'tdesign-react';
import {
  MinusCircleIcon,
  Icon,
} from 'tdesign-icons-react';
import moment from 'moment';
import config from '../config.json';
import context from '../context/userInfo';
import { useNavigate } from 'react-router-dom';
const { FormItem, FormList } = Form;
const options = [
  {
    content: 'Edit',
    value: 1,
  },
  {
    content: 'Publish',
    value: 2,
  },
  {
    content: 'UnPublish',
    value: 3,
  },
  {
    content: 'View',
    value: 4,
  },
  {
    content: 'Delete',
    value: 5,
  },
];
export default function Page () {
  const navTo = useNavigate();
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [curListing, setCurListing] = useState(null);
  const { userInfo } = useContext(context);
  const [list, setList] = useState([]);
  const fetchListings = () => {
    fetch(`http://localhost:${config.BACKEND_PORT}/listings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + userInfo.token,
      },
    }).then(async (response) => {
      const jsonRes = await response.json();
      if (response.status !== 200) {
        MessagePlugin.error(jsonRes.error);
        return;
      }
      const listings = jsonRes.listings;
      let needData = [];
      const myListings = [];
      listings.forEach((element) => {
        if (element.owner === userInfo.email) {
          myListings.push(element);
          needData.push(
            fetch(
              `http://localhost:${config.BACKEND_PORT}/listings/${element.id}`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + userInfo.token,
                },
              }
            ).then((response) => {
              return response.json();
            })
          );
        }
      });
      Promise.all(needData).then((results) => {
        needData = results.map((ele, index) => {
          ele.listing.id = myListings[index].id;
          return ele.listing;
        });
        console.log('needData = ', needData);
        setList(needData);
      });
    });
  };
  useEffect(
    () => {
      userInfo && fetchListings();
    },
    [userInfo]
  );
  const onSubmit = (e) => {
    if (e.validateResult === true) {
      const formVal = form.getFieldsValue?.(true);
      console.log('formVal = ', formVal);
      fetch(
        `http://localhost:${config.BACKEND_PORT}/listings/publish/${
          curListing.id
        }`,
        {
          method: 'PUT',
          body: JSON.stringify({
            availability: formVal.availabilityDateRange,
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + userInfo.token,
          },
        }
      ).then(async (response) => {
        const jsonRes = await response.json();
        if (response.status !== 200) {
          MessagePlugin.error(jsonRes.error);
          return;
        }
        setVisible(false);
        fetchListings();
        MessagePlugin.success('Successfully');
      });
    }
  };
  return (
    <div className='my'>
      <Drawer
        closeBtn
        closeOnEscKeydown
        closeOnOverlayClick
        destroyOnClose={false}
        footer={false}
        header
        mode='overlay'
        onClose={() => {
          setVisible(false);
        }}
        placement='right'
        preventScrollThrough
        showInAttachedElement={false}
        showOverlay
        sizeDraggable={false}
        size='medium'
        visible={visible}
      >
        <Form
          statusIcon={false}
          onSubmit={onSubmit}
          colon={true}
          labelWidth={0}
          form={form}
        >
          <div
            style={{
              marginBottom: 5,
            }}
          >
            Availability DateRange:
          </div>
          <FormList
            name='availabilityDateRange'
            rules={[{ required: true, type: 'error', message: 'required' }]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <FormItem key={key}>
                    <FormItem
                      {...restField}
                      name={[name, 'date']}
                      rules={[
                        { required: true, type: 'error', message: 'required' },
                      ]}
                    >
                      <DateRangePicker
                        placeholder='Please select a date range'
                        disableDate={(date) => {
                          return !(
                            moment(date).format('YYYY-MM-DD') >=
                            moment().format('YYYY-MM-DD')
                          );
                        }}
                        clearable
                      />
                    </FormItem>
                    <FormItem>
                      <MinusCircleIcon
                        size='20px'
                        style={{ cursor: 'pointer' }}
                        onClick={() => remove(name)}
                      />
                    </FormItem>
                  </FormItem>
                ))}
                <FormItem>
                  <Button
                    theme='default'
                    variant='dashed'
                    onClick={() => add({ type: '', bedRoomNumber: '' })}
                  >
                    Add field
                  </Button>
                </FormItem>
              </>
            )}
          </FormList>

          <FormItem>
            <Button theme='primary' type='submit'>
              Submit
            </Button>
          </FormItem>
        </Form>
      </Drawer>
      <div className='create'>
        <Button
          onClick={() => {
            navTo('/createOrEdit/create');
          }}
        >
          Create
        </Button>
      </div>
      <div className='mycard'>
        <Row
          gutter={[
            {
              xs: 10,
              sm: 20,
            },
            {
              xs: 10,
              sm: 20,
            },
          ]}
        >
          {list.map((ele, index) => {
            return (
              <Col key={index} xs={12} sm={6} md={4}>
                <Card
                  actions={
                    <Dropdown
                      options={options}
                      onClick={({ value }) => {
                        console.log('value = ', value);
                        if (value === 1) {
                          navTo(`/createOrEdit/${ele.id}`);
                        }
                        if (value === 2) {
                          if (ele.published) {
                            MessagePlugin.error('You have published');
                            return;
                          }
                          setCurListing(ele);
                          setVisible(true);
                        }
                        if (value === 3) {
                          fetch(
                            `http://localhost:${
                              config.BACKEND_PORT
                            }/listings/unpublish/${ele.id}`,
                            {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: 'Bearer ' + userInfo.token,
                              },
                            }
                          ).then(async (response) => {
                            const jsonRes = await response.json();
                            if (response.status !== 200) {
                              MessagePlugin.error(jsonRes.error);
                              return;
                            }
                            fetchListings();
                            MessagePlugin.success('Successfully');
                          });
                        }
                        if (value === 4) {
                          navTo(`/listingRecords/${ele.id}`);
                        }
                        if (value === 5) {
                          fetch(
                            `http://localhost:${config.BACKEND_PORT}/listings/${
                              ele.id
                            }`,
                            {
                              method: 'DELETE',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: 'Bearer ' + userInfo.token,
                              },
                            }
                          ).then(async (response) => {
                            const jsonRes = await response.json();
                            if (response.status !== 200) {
                              MessagePlugin.error(jsonRes.error);
                              return;
                            }
                            fetchListings();
                            MessagePlugin.success('Successfully');
                          });
                        }
                      }}
                      minColumnWidth='112'
                    >
                      <Button variant='text' shape='square'>
                        <Icon name='more' size='24' />
                      </Button>
                    </Dropdown>
                  }
                  bordered
                  theme='poster2'
                  cover={
                    <img
                      style={{
                        height: 180,
                      }}
                      src={ele?.thumbnail[0]?.url}
                      alt=''
                    />
                  }
                  footer={
                    <Comment
                      content={
                        <div>
                          <div
                            style={{
                              marginBottom: 10,
                              color: '#333',
                            }}
                          >
                            <span
                              style={{
                                color: 'red',
                                fontSize: 20,
                              }}
                            >
                              ${ele.price}
                            </span>{' '}
                            / per night
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Rate
                              disabled
                              allowHalf
                              size={16}
                              value={
                                ele?.reviews?.reduce((pre, cur) => {
                                  return Number(pre) + Number(cur.score);
                                }, 0) / ele?.reviews?.length
                              }
                            />
                            <span
                              style={{
                                marginLeft: 5,
                              }}
                            >
                              {ele?.reviews?.length}
                            </span>
                          </div>
                        </div>
                      }
                    />
                  }
                >
                  <div
                    style={{
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: 'red',
                        marginRight: 5,
                      }}
                    >
                      {ele?.metadata?.type}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: 'green',
                        marginRight: 5,
                      }}
                    >
                      {ele?.metadata.bedRooms?.length}bedrooms
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: 'blue',
                      }}
                    >
                      {ele?.metadata?.bathrooms}bathrooms
                    </span>
                  </div>
                  <h3 className='ellipsis'>{ele.title}</h3>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
}
