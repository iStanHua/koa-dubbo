'use strict'

import { Dubbo, setting } from 'dubbo2.js'

import service from './service'

const dubboSetting = setting
  .match(
    [
      'com.alibaba.dubbo.demo.DemoProvider',
      'com.alibaba.dubbo.demo.ErrorProvider',
    ],
    {
      version: '1.0.0',
    },
  )
  .match('com.alibaba.dubbo.demo.BasicTypeProvider', { version: '2.0.0' });

const dubbo = new Dubbo({
  application: { name: 'dubbo-node-consumer' },
  register: 'localhost:3000',
  service,
  dubboSetting,
});

dubbo.use(async (ctx, next) => {
  await next();
  console.log('-providerAttachments-->', ctx.providerAttachments);
});

// dubbo.ready().then(() => {
//   console.log('dubbo was ready');
// });

// dubbo.subscribe({
//   onTrace: msg => {
//     console.log(msg);
//   },
// });

//cost middleware
/*dubbo.use(async function costTime(ctx, next) {
  console.log('before dubbo cost middleware');
  const startTime = Date.now();
  await next();
  const endTime = Date.now();
  console.log('end makecostTime->', endTime - startTime);
});
*/

dubbo.use(async function trace(ctx, next) {
  const uuid = Date.now()
  ctx.attachments = {
    uuid,
  }

  ctx.attachments = {
    userId: uuid,
  }

  await next()
})

export default dubbo