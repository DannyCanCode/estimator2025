#!/bin/bash

# Install Python dependencies
cd backend/app
pip install -r requirements.txt

# Build frontend
cd ../../
npm install
npm run build 