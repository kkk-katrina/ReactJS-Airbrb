import React, { useContext, useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Comment,
  Rate,
  Form,
  Input,
  MessagePlugin,
  RangeInput,
  DateRangePicker,
  Radio,
} from 'tdesign-react';
import moment from 'moment';
import config from '../config.json';
import context from '../context/userInfo';
import { useNavigate } from 'react-router-dom';
const { FormItem } = Form;
export default function Page () {
  const navTo = useNavigate();
  const [form] = Form.useForm();
  const { userInfo } = useContext(context);
  const [list, setList] = useState([]);
  const [originData, setOriginData] = useState([]);
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
      // console.log('listings = ', listings);
      let needData = [];
      listings.forEach((element) => {
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
      });
      Promise.all(needData).then((results) => {
        needData = results.map((ele, index) => {
          ele.listing.id = listings[index].id;
          return ele.listing;
        });
        const listData = [];
        needData.forEach((element) => {
          if (element.published) {
            listData.push(element);
          }
        });
        console.log('listData = ', listData);
        if (userInfo) {
          fetch(`http://localhost:${config.BACKEND_PORT}/bookings`, {
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
            const bookings = jsonRes.bookings;
            bookings.forEach((ele) => {
              listData.forEach((ele2) => {
                // console.log('ele = ', ele)
                // console.log('ele2 = ', ele2)
                if (ele.owner === userInfo.email && Number(ele.listingId) === Number(ele2.id)) {
                  ele2.bookings = 1;
                } else {
                  ele2.bookings = 0;
                }
              });
            });
            const neddData = listData.sort((a, b) => {
              return b.bookings - a.bookings;
            })
            // console.log('neddData = ', neddData)
            setList(neddData);
            setOriginData(neddData);
            // console.log('needData = ', needData);
          });
        } else {
          setList(listData);
          setOriginData(listData);
        }
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
      const { title, ratings, price, dateRange, bedrooms } = formVal;
      let needData = [];
      const cloneData = [...originData];
      cloneData.forEach((element) => {
        if (title) {
          if (
            element.title.toUpperCase().indexOf(title.toUpperCase()) !== -1 ||
            element.address.toUpperCase().indexOf(title.toUpperCase()) !== -1
          ) {
            needData.push(element);
            return;
          }
        }
        if (price.length && price[0] && price[1]) {
          if (
            Number(price[1]) >= element.price &&
            Number(price[0]) <= element.price
          ) {
            needData.push(element);
            return;
          }
        }
        if (bedrooms.length && bedrooms[0] && bedrooms[1]) {
          // console.log('bedrooms = ', bedrooms)
          // console.log('element = ', element.metadata.bedRooms)
          if (
            Number(bedrooms[1]) >= element.metadata.bedRooms.length &&
            Number(bedrooms[0]) <= element.metadata.bedRooms.length
          ) {
            needData.push(element);
            return;
          }
        }
        if (dateRange.length) {
          const { availability } = element;
          for (let i = 0; i < availability.length; i++) {
            const ele = availability[i];
            const { date } = ele;
            if (
              moment(dateRange[0]).format('YYYY-MM-DD') >=
                moment(date[0]).format('YYYY-MM-DD') &&
              moment(dateRange[1]).format('YYYY-MM-DD') <=
                moment(date[1]).format('YYYY-MM-DD')
            ) {
              needData.push(element);
              element.start = moment(date[0]).format('YYYY-MM-DD');
              element.end = moment(date[1]).format('YYYY-MM-DD');
              return;
            }
          }
        }
      });
      if (
        !title &&
        !(price.length && price[0] && price[1]) &&
        !(bedrooms.length && bedrooms[0] && bedrooms[1]) &&
        !dateRange.length
      ) {
        needData = cloneData;
      }
      if (ratings) {
        needData.forEach((ele) => {
          ele.score =
            ele?.reviews?.reduce((pre, cur) => {
              return pre + cur;
            }, 0) / ele?.reviews?.length;
        });
        if (ratings === 'asc') {
          needData = needData.sort((x, y) => {
            return x.score - y.score;
          });
        } else {
          needData = needData.sort((x, y) => {
            return y.score - x.score;
          });
        }
      }
      setList(needData);
    }
  };
  return (
    <div className='my'>
      <div className='allSearch'>
        <Form
          statusIcon={false}
          onSubmit={onSubmit}
          colon={true}
          labelWidth={0}
          form={form}
        >
          <Row
            gutter={[
              {
                xs: 10,
                sm: 10,
              },
              {
                xs: 10,
                sm: 10,
              },
            ]}
          >
            <Col xs={12} sm={12}>
              <FormItem name='title'>
                <Input
                  clearable={true}
                  placeholder='Please enter Title or Address'
                />
              </FormItem>
            </Col>
            <Col xs={12} sm={6}>
              <FormItem name='price' label='Price'>
                <RangeInput placeholder='price range' />
              </FormItem>
            </Col>
            <Col xs={12} sm={6}>
              <FormItem name='bedrooms' label='Bedrooms'>
                <RangeInput placeholder='bedrooms range' />
              </FormItem>
            </Col>
            <Col xs={12} sm={6}>
              <FormItem name='ratings' label='Ratings'>
                <Radio.Group>
                  <Radio value=''>None</Radio>
                  {/* to high */}
                  <Radio value='asc'>Asc</Radio>
                  <Radio value='desc'>Desc</Radio>
                </Radio.Group>
              </FormItem>
            </Col>
            <Col xs={12} sm={6}>
              <FormItem name='dateRange' label='DateRange'>
                <DateRangePicker
                  placeholder='Please select'
                  disableDate={(date) => {
                    return !(
                      moment(date).format('YYYY-MM-DD') >=
                      moment().format('YYYY-MM-DD')
                    );
                  }}
                  clearable
                />
              </FormItem>
            </Col>
            <Col xs={12} sm={12}>
              <FormItem>
                <Button theme='primary' type='submit'>
                  Search
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
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
                    <Button
                      onClick={() => {
                        navTo(
                          `/detail/${ele.id}/${ele.start || ''}~${ele.end ||
                            ''}`
                        );
                      }}
                      size='small'
                    >
                      go to detail
                    </Button>
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
