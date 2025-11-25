#!/bin/bash

pm2 stop steveastFamilyBot && git pull && npm run build && pm2 start steveastFamilyBot