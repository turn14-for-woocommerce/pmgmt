import dotenv from 'dotenv';
import 'reflect-metadata';
import expressAppConfig from './config/expressApp';
import mongoConfig from './config/mongoose';
import jobSchedulerConfig from './productMgmt/config/jobSchedulerConfig';

// load env variables
dotenv.config();

// log ts files instead of js
require('source-map-support').install();

mongoConfig();
jobSchedulerConfig();

const app = expressAppConfig();
app.listen(process.env.PORT || '8083');