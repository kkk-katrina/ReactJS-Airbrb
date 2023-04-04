import React, { useContext, useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Comment,
  Swiper,
  Rate,
  MessagePlugin,
  DateRangePicker,
  Tabs,
  Table,
  List,
  Popup,
  Space,
  Textarea,
  Popconfirm,
} from 'tdesign-react';
import moment from 'moment';
import config from '../config.json';
import context from '../context/userInfo';
import { useParams } from 'react-router-dom';
const { ListItem } = List;
const { TabPanel } = Tabs;
const { SwiperItem } = Swiper;
export default function Page () {
  const [replyData, setReplayData] = useState('');
  const [rateValue, setRateValue] = useState(0);
  const { userInfo } = useContext(context);
  const columns = [
    {
      title: 'owner',
      colKey: 'owner',
    },
    {
      title: 'Date Range',
      colKey: 'dateRang',
      cell: ({ row }) => {
        return `${row.dateRange.start}~${row.dateRange.end}`;
      },
    },
    {
      title: 'status',
      colKey: 'status',
    },
    {
      title: 'totalPrice',
      colKey: 'totalPrice',
    },
    {
      title: '#',
      colKey: '#',
      cell: ({ row }) => {
        return (
          <Popup
            trigger='click'
            showArrow
            content={
              <Space direction='vertical' align='end'>
                <Textarea
                  placeholder='请输入内容'
                  value={replyData}
                  onChange={setReplayData}
                />
                <Rate
                  allowHalf
                  size={16}
                  value={rateValue}
                  onChange={setRateValue}
                />
                <Button
                  onClick={() => {
                    // console.log('replyData = ', replyData);
                    // console.log('rateValue = ', rateValue);
                    fetch(
                      `http://localhost:${
                        config.BACKEND_PORT
                      }/listings/${listingId}/review/${row.id}`,
                      {
                        method: 'PUT',
                        body: JSON.stringify({
                          review: {
                            email: userInfo.email,
                            score: rateValue,
                            replyData,
                          },
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
                      fetchListingDetail();
                      setReplayData('');
                      setRateValue('');
                      MessagePlugin.success('Successfully');
                    });
                  }}
                >
                  回复
                </Button>
              </Space>
            }
          >
            <Button disabled={row.status !== 'accepted'} size='small'>
              comment
            </Button>
          </Popup>
        );
      },
    },
  ];
  const { listingId, date } = useParams();
  const [start, end] = date.split('~');
  const [daysDiff, setDaysDiff] = useState(null);
  useEffect(() => {
    if (start && end) {
      setDaysDiff(moment(end).diff(moment(start), 'days'));
    }
  }, []);
  const [height, setHeight] = useState(200);
  // console.log('start = ', start);
  // console.log('end = ', end);
  // console.log('daysDiff = ', daysDiff);
  const [listing, setListing] = useState({});
  const fetchListingDetail = () => {
    fetch(`http://localhost:${config.BACKEND_PORT}/listings/${listingId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async (response) => {
      const jsonRes = await response.json();
      if (response.status !== 200) {
        MessagePlugin.error(jsonRes.error);
        return;
      }
      const listing = jsonRes.listing;
      console.log('listings = ', listing);
      setListing(listing);
    });
  };
  const [dateRange, setDateRange] = useState([]);
  const [bookingList, setBookingList] = useState([]);
  const getMyBookingList = () => {
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
      const needData = [];
      bookings.forEach((ele) => {
        if (ele.owner === userInfo.email && ele.listingId === listingId) {
          needData.push(ele);
        }
      });
      // console.log('needData = ', needData);
      setBookingList(needData);
    });
  };
  useEffect(
    () => {
      if (userInfo) {
        getMyBookingList();
      }
    },
    [userInfo]
  );
  useEffect(() => {
    if (start && end) {
      setDateRange([start, end]);
    }
  }, []);
  useEffect(() => {
    if (window.innerWidth < 600) {
      setHeight(100);
    } else {
      setHeight(200);
    }
    window.onresize = () => {
      if (window.innerWidth < 600) {
        setHeight(100);
      } else {
        setHeight(200);
      }
    };
    fetchListingDetail();
  }, []);
  return (
    <div className='detail'>
      <Swiper type={'card'} height={height}>
        {listing?.metadata?.detailImages?.map((ele, index) => {
          return (
            <SwiperItem key={index}>
              <div className='demo-item'>
                <img
                  src={ele.url}
                  style={{
                    width: '100%',
                    maxHeight: 200,
                  }}
                />
              </div>
            </SwiperItem>
          );
        })}
      </Swiper>
      <div
        style={{
          height: 20,
        }}
      />
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
        <Col
          xs={{
            span: 12,
            order: 2,
          }}
          sm={{
            span: 8,
            order: 1,
          }}
        >
          <Tabs placement={'top'} size={'medium'} defaultValue={'1'}>
            <TabPanel value='1' label='detail'>
              <div className='tabs-content' style={{ margin: 20 }}>
                <Card
                  bordered
                  theme='poster2'
                  footer={
                    <Comment
                      content={
                        <div>
                          {daysDiff && (
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
                                ${listing.price * daysDiff}
                              </span>{' '}
                              / per stay
                            </div>
                          )}
                          {!daysDiff && (
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
                                ${listing.price}
                              </span>{' '}
                              / per night
                            </div>
                          )}
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
                                listing?.reviews?.reduce((pre, cur) => {
                                  return Number(pre) + Number(cur.score);
                                }, 0) / listing?.reviews?.length
                              }
                            />
                            <span
                              style={{
                                marginLeft: 5,
                              }}
                            >
                              {listing?.reviews?.length}
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
                      {listing?.metadata?.type}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: 'green',
                        marginRight: 5,
                      }}
                    >
                      {listing?.metadata?.bedRooms?.length}bedrooms
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: 'blue',
                        marginRight: 5,
                      }}
                    >
                      {listing?.metadata?.bathrooms}bathrooms
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: 'blue',
                        marginRight: 5,
                      }}
                    >
                      {listing?.metadata?.bedRooms?.reduce((pre, cur) => {
                        return Number(cur.bedsNumber) + Number(pre);
                      }, 0)}
                      beds
                    </span>
                  </div>
                  <h3 className='ellipsis'>{listing.title}</h3>
                  <div>{listing.address}</div>
                </Card>
              </div>
            </TabPanel>
            <TabPanel value='2' label='my booking list'>
              <div className='tabs-content' style={{ margin: 20 }}>
                <Table
                  data={bookingList}
                  columns={columns}
                  size='small'
                  resizable tableLayout='fixed'
                  bordered
                />
              </div>
            </TabPanel>
            <TabPanel value='3' label='comment'>
              <div className='tabs-content' style={{ margin: 20 }}>
                <List split={true}>
                  {listing?.reviews?.map((ele, index) => {
                    return (
                      <ListItem key={index}>
                        <Comment
                          author={ele.email}
                          content={
                            <div>
                              <div
                                style={{
                                  marginBottom: 10,
                                  color: '#333',
                                }}
                              >
                                {ele.replyData}
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
                                  value={ele.score}
                                />
                              </div>
                            </div>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </div>
            </TabPanel>
          </Tabs>
        </Col>
        <Col
          xs={{
            span: 12,
            order: 1,
          }}
          sm={{
            span: 4,
            order: 2,
          }}
        >
          <div
            style={{
              padding: 15,
              background: '#fff',
            }}
          >
            <DateRangePicker
              placeholder='Please select'
              value={dateRange}
              onChange={(val) => {
                console.log(val);
                if (val.length === 0) {
                  setDaysDiff(null);
                } else {
                  const days = moment(val[1]).diff(moment(val[0]), 'days');
                  setDaysDiff(days);
                }
                setDateRange(val);
              }}
              disableDate={(cdate) => {
                const { availability } = listing;
                for (let i = 0; i < availability.length; i++) {
                  const ele = availability[i];
                  const { date } = ele;
                  if (
                    !(
                      moment(cdate).format('YYYY-MM-DD') >=
                        moment(date[0]).format('YYYY-MM-DD') &&
                      moment(cdate).format('YYYY-MM-DD') <=
                        moment(date[1]).format('YYYY-MM-DD')
                    )
                  ) {
                    return true;
                  }
                }
              }}
              clearable
            />
            <div
              style={{
                marginRight: 10,
                fontSize: 12,
                fontWeight: 'bold',
                color: 'red',
              }}
            >
              Price: ${daysDiff && daysDiff * listing.price}
            </div>
            <Popconfirm
              content={`Confirm that you will spend $${daysDiff &&
                daysDiff * listing.price} to book ${daysDiff} days?`}
              destroyOnClose
              placement='top'
              showArrow
              theme='default'
              onConfirm={() => {
                fetch(
                  `http://localhost:${
                    config.BACKEND_PORT
                  }/bookings/new/${listingId}`,
                  {
                    method: 'POST',
                    body: JSON.stringify({
                      dateRange: {
                        start: dateRange[0],
                        end: dateRange[1],
                      },
                      totalPrice: daysDiff * listing.price,
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
                  MessagePlugin.success('Successfully');
                  getMyBookingList();
                });
              }}
            >
              <Button disabled={!userInfo || !daysDiff} theme='primary'>
                Make a Booking
              </Button>
            </Popconfirm>
          </div>
        </Col>
      </Row>
    </div>
  );
}
