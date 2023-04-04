import React, { useContext, useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  MessagePlugin,
  Table,
} from 'tdesign-react';
import moment from 'moment';
import config from '../config.json';
import context from '../context/userInfo';
import { useParams } from 'react-router-dom';
export default function Page () {
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
          <div>
            <Button
              style={{
                marginRight: 5,
                marginBottom: 5,
              }}
              size='small'
              disabled={row.status !== 'pending'}
              onClick={() => {
                fetch(
                  `http://localhost:${config.BACKEND_PORT}/bookings/accept/${
                    row.id
                  }`,
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
                  getMyBookingList();
                  MessagePlugin.success('Successfully');
                });
              }}
            >
              accept
            </Button>
            <Button
              style={{
                marginRight: 5,
                marginBottom: 5,
              }}
              disabled={row.status !== 'pending'}
              theme='danger'
              size='small'
              onClick={() => {
                fetch(
                  `http://localhost:${config.BACKEND_PORT}/bookings/decline/${
                    row.id
                  }`,
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
                  getMyBookingList();
                  MessagePlugin.success('Successfully');
                });
              }}
            >
              deny
            </Button>
            <Button
              style={{
                marginBottom: 5,
              }}
              theme='danger'
              size='small'
              disabled={row.status === 'pending'}
              onClick={() => {
                fetch(
                  `http://localhost:${config.BACKEND_PORT}/bookings/${row.id}`,
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
                  getMyBookingList();
                  MessagePlugin.success('Successfully');
                });
              }}
            >
              delete
            </Button>
          </div>
        );
      },
    },
  ];
  const columns2 = [
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
  ];
  const { listingId } = useParams();
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
        if (ele.listingId === listingId) {
          needData.push(ele);
        }
      });
      console.log('needData = ', needData);
      setBookingList(needData);
    });
  };
  useEffect(() => {
    fetchListingDetail();
  }, []);
  useEffect(
    () => {
      if (userInfo) {
        getMyBookingList();
      }
    },
    [userInfo]
  );
  const needData = [];
  bookingList.forEach((ele) => {
    if (ele.status !== 'pending') {
      needData.push(ele);
    }
  });
  return (
    <div className='detail'>
      <div>
        <h3>Booking Request</h3>
        <Table
          data={bookingList}
          resizable
          tableLayout='fixed'
          columns={columns}
          bordered
        />
      </div>

      <div
        style={{
          marginTop: 20,
        }}
      >
        <h3>Booking History</h3>
        <Table
          data={needData}
          resizable
          tableLayout='fixed'
          columns={columns2}
          bordered
        />
      </div>
      <div
        style={{
          marginTop: 20,
        }}
      >
        <h3>Booking Statistics</h3>
        <Row
          gutter={[
            {
              xs: 20,
              sm: 20,
            },
            {
              xs: 20,
              sm: 20,
            },
          ]}
        >
          <Col xs={12} sm={4}>
            <Card title='Online Days'>
              {listing.postedOn
                ? Math.abs(
                  moment(moment(listing.postedOn).format('YYYY-MM-DD')).diff(
                    moment(moment().format('YYYY-MM-DD')),
                    'days'
                  )
                )
                : 0} days
            </Card>
          </Col>
          <Col xs={12} sm={4}>
            <Card title='Total Booking Days'>
              {bookingList.reduce((pre, cur) => {
                if (cur.status === 'accepted') {
                  const { start, end } = cur.dateRange;
                  return Number(pre) + moment(end).diff(moment(start), 'days');
                } else {
                  return Number(pre);
                }
              }, 0)} days
            </Card>
          </Col>
          <Col xs={12} sm={4}>
            <Card title='Total Profit'>
              {'$ '}
              {bookingList.reduce((pre, cur) => {
                if (cur.status === 'accepted') {
                  return Number(pre) + cur.totalPrice;
                } else {
                  return Number(pre);
                }
              }, 0)}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
