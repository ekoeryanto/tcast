# tcast
TCast SMS Indonesia Javascript client library

## Install

```bash
npm add tcast
```

> `npm` can be changed to `yarn`

## Usage

### Load the library
```js
const tcast = require('tcast')
```

### Send SMS
```js
const numbers = ['62812xxx', '62855xxx']
const message = 'hello world'
const schedule = new Date('2080-01-02') // optional
const result = await tcast.send(numbers, message, schedule)

/*
{
  total: {
    success: 10,
    fail: 1
  },
  result: [
    {id: 1, number: '62812xxx'}
    ...
  ]
}
*/

```

### Get Balance
```js
const result = await tcast.balance()

/*
{
  balance: 1000,
  gift: 500,
  total: 1500
}
*/

```

### Get Messages
```js
const result = await tcast.messages()

/*
{
  total: 10,
  result: [
    { id: 12, number: '62812xxx', time: '14/10/2020, 11:17:52', message: 'hello'}
    ...
  ]
}
*/

```

### Get Reports
```js
const ids = [1,2,3]
const result = await tcast.reports(ids)

/*
{
  total: {
    sent: 1,
    unsent: 0,
    sending: 0,
    notFound: 0,
    fail: 0,
  },
  result: [
    {
      id: 1,
      number: '6281xxx',
      time: '14/10/2020, 11:17:52',
      status: 'sent' || 'unsent' || 'sending' || 'fail'
    }
    ...
  ]
}
*/

```

