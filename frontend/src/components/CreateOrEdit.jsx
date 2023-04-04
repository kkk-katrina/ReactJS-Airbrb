import React, { useEffect, useContext } from 'react';
import {
  Form,
  Input,
  Button,
  MessagePlugin,
  InputNumber,
  Upload,
  TagInput,
} from 'tdesign-react';
import { MinusCircleIcon } from 'tdesign-icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import config from '../config.json';
import context from '../context/userInfo';
const { FormItem, FormList } = Form;
export default function Page () {
  const [form] = Form.useForm();
  const navTo = useNavigate();
  const { listingId } = useParams();
  const { userInfo } = useContext(context);
  useEffect(
    () => {
      if (listingId !== 'create' && userInfo) {
        fetch(`http://localhost:${config.BACKEND_PORT}/listings/${listingId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + userInfo.token,
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((response) => {
            console.log('response = ', response);
            const {
              address,
              metadata,
              price,
              thumbnail,
              title,
            } = response.listing;
            const {
              amenities,
              bathrooms,
              bedRooms,
              detailImages,
              type,
            } = metadata;
            form.setFieldsValue?.({
              address,
              price,
              thumbnail,
              title,
              amenities,
              bathrooms,
              bedRooms,
              detailImages,
              type,
            });
          });
      }
    },
    [userInfo]
  );
  const onSubmit = (e) => {
    if (e.validateResult === true) {
      const formVal = form.getFieldsValue?.(true);
      console.log('formVal = ', formVal);
      if (listingId === 'create') {
        fetch(`http://localhost:${config.BACKEND_PORT}/listings/new`, {
          method: 'POST',
          body: JSON.stringify({
            title: formVal.title,
            address: formVal.address,
            price: formVal.price,
            thumbnail: formVal.thumbnail,
            metadata: {
              bathrooms: formVal.bathrooms,
              detailImages: formVal.detailImages,
              amenities: formVal.amenities,
              bedRooms: formVal.bedRooms,
              type: formVal.type,
            },
          }),
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
          navTo('/my');
          MessagePlugin.success('Successfully');
        });
      } else {
        fetch(`http://localhost:${config.BACKEND_PORT}/listings/${listingId}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: formVal.title,
            address: formVal.address,
            price: formVal.price,
            thumbnail: formVal.thumbnail,
            metadata: {
              bathrooms: formVal.bathrooms,
              detailImages: formVal.detailImages,
              amenities: formVal.amenities,
              bedRooms: formVal.bedRooms,
              type: formVal.type,
            },
          }),
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
          navTo('/my');
          MessagePlugin.success('Successfully');
        });
      }
    }
  };
  return (
    <div className='createOrEdit'>
      <Form
        statusIcon={false}
        onSubmit={onSubmit}
        colon={true}
        labelWidth={0}
        form={form}
      >
        <FormItem
          label='Title'
          name='title'
          rules={[{ required: true, type: 'error', message: 'required' }]}
        >
          <Input clearable={true} placeholder='Please enter your Title' />
        </FormItem>
        <FormItem
          label='Address'
          name='address'
          rules={[{ required: true, type: 'error', message: 'required' }]}
        >
          <Input clearable={true} placeholder='Please enter your Address' />
        </FormItem>
        <FormItem
          label='Type'
          name='type'
          rules={[{ required: true, type: 'error', message: 'required' }]}
        >
          <Input clearable={true} placeholder='Please enter your Type' />
        </FormItem>
        <FormItem
          label='Price'
          name='price'
          rules={[{ required: true, type: 'error', message: 'required' }]}
        >
          <InputNumber
            style={{
              width: '80%',
            }}
            min={0}
            step={1}
            placeholder='Please enter your Price'
            theme='row'
          />
        </FormItem>
        <FormItem
          label='Bathrooms'
          name='bathrooms'
          rules={[{ required: true, type: 'error', message: 'required' }]}
        >
          <InputNumber
            style={{
              width: '80%',
            }}
            min={0}
            step={1}
            placeholder='Please enter your Bathrooms Number'
            theme='row'
          />
        </FormItem>
        <FormItem
          label='Thumbnail'
          name='thumbnail'
          rules={[{ required: true, type: 'error', message: 'required' }]}
        >
          <Upload
            theme='image'
            max={1}
            autoUpload={false}
            tips='Please upload your Thumbnail'
            accept='image/*'
          />
        </FormItem>
        <FormItem
          label='DetailImages'
          name='detailImages'
          rules={[{ required: true, type: 'error', message: 'required' }]}
        >
          <Upload
            theme='image'
            max={10}
            multiple
            autoUpload={false}
            tips='Please upload your Detail Images'
            accept='image/*'
          />
        </FormItem>
        <FormItem
          label='Amenities'
          name='amenities'
          rules={[{ required: true, type: 'error', message: 'required' }]}
        >
          <TagInput
            style={{
              width: '100%',
            }}
            clearable={true}
            defaultInputValue=''
            dragSort={false}
            excessTagsDisplayType='break-line'
            minCollapsedNum={0}
            placeholder='Please enter your Amenities'
            size='medium'
          />
        </FormItem>
        <div
          style={{
            marginBottom: 5,
          }}
        >
          BedRooms:
        </div>
        <FormList
          name='bedRooms'
          rules={[{ required: true, type: 'error', message: 'required' }]}
        >
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <FormItem key={key}>
                  <FormItem
                    {...restField}
                    name={[name, 'type']}
                    rules={[
                      { required: true, type: 'error', message: 'required' },
                    ]}
                  >
                    <Input
                      style={{
                        width: 80,
                      }}
                      placeholder='type'
                    />
                  </FormItem>
                  <FormItem
                    {...restField}
                    name={[name, 'bedsNumber']}
                    rules={[
                      { required: true, type: 'error', message: 'required' },
                    ]}
                  >
                    <Input
                      style={{
                        width: 110,
                      }}
                      placeholder='bedsNumber'
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
    </div>
  );
}
