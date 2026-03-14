#!/bin/bash
set -e

echo "Running Volunteer Matching Helper Test Suite..."

cd backend || exit

echo "Setting RAILS_ENV to test..."
rails db:environment:set RAILS_ENV=test

echo "Preparing test database..."
rails db:test:prepare

echo "Running RSpec tests..."
bundle exec rspec
