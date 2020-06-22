'use strict';
import * as functions from 'firebase-functions'
import {Entry, Log, Logging} from '@google-cloud/logging';

export const log4bingo = functions.https.onRequest((request, response) => {
  try {
    const projectId = process.env.GCLOUD_PROJECT;
    const logging = new Logging({projectId});
    const logName = 'test-log-bingo-democraftia'

    // Selects the log to write to
    const log = logging.log(logName);

    // The data to write to the log
    const text = 'agreed that it was neither possible nor necessary to educate people who never questioned anything';
    const metadata = {
      resource: {
        type: 'cloud_function',
        severity: 'INFO',
        labels: {function_name: process.env.FUNCTION_NAME},
      },
    };


    // A structured log entry
    const logEntry = log.entry(
        metadata,
        {
          name: 'log4bingo',
          ver: 'I don\'t know',
          favorite_audience: 'web',
        }
    );
    // Prepares a log entry
    const entry = log.entry(metadata, text);

    async function writeLog() {
      // Writes the log entry
      await log.write([logEntry]);
      console.log(logEntry);
    }

    writeLog();

    const currentdate = new Date();
    const t_now = currentdate.toLocaleTimeString();

    // Build structured log messages as an object.

    // Complete a structured log entry.
    const str_entity = Object.assign(
        {
          severity: 'NOTICE',
          message: 'It doesn\'t make sense. It isn\'t even good grammar.',
          // Log viewer accesses 'component' as 'jsonPayload.component'.
          component: 'arbitrary-property',
        }
    );

// Serialize to a JSON string and output.
    console.log(JSON.stringify(str_entity));


    response.send(`func invoked on project: ${projectId}, time: ${t_now}\n\n`,);
  } catch (error) {
    console.log(error);
    const projectId = process.env.GCLOUD_PROJECT;
    const logging = new Logging({projectId});
    reportError(error, {user: 'usernum'});

  }


});

/**
 * To keep on top of errors, we should raise a verbose error report with Stackdriver rather
 * than simply relying on console.error. This will calculate users affected + send you email
 * alerts, if you've opted into receiving them.
 */
//"build": "./node_modules/.bin/tsc",
//
// [START reporterror]
function reportError(logging, err, context = {}) {
  // This is the name of the StackDriver log stream that will receive the log
  // entry. This name can be any valid log stream name, but must contain "err"
  // in order for the error to be picked up by StackDriver Error Reporting.
  const logName = 'errors';
  const log = logging.log(logName);

  // https://cloud.google.com/logging/docs/api/ref_v2beta1/rest/v2beta1/MonitoredResource
  const metadata = {
    resource: {
      type: 'cloud_function',
      labels: {function_name: process.env.FUNCTION_NAME},
    },
  };

  // https://cloud.google.com/error-reporting/reference/rest/v1beta1/ErrorEvent
  const errorEvent = {
    message: err.stack,
    serviceContext: {
      service: process.env.FUNCTION_NAME,
      resourceType: 'cloud_function',
    },
    context: context,
  };

  // Write the error log entry
  return new Promise((resolve, reject) => {
    log.write(log.entry(metadata, errorEvent), (error) => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
}
// [END reporterror]

/**
 * Sanitize the error message for the user.
 */
function userFacingMessage(error) {
  return error.type
      ? error.message
      : 'An error occurred, developers have been alerted';
}

