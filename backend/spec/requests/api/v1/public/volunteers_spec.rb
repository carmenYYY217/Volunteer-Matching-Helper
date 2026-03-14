require 'rails_helper'

RSpec.describe 'Api::V1::Public::Volunteers', type: :request do
  describe 'POST /api/v1/public/volunteers' do
    context 'with valid parameters' do
      let(:valid_attributes) do
        {
          volunteer: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            phone: '555-1234',
            availabilities_attributes: [
              { day_of_week: 'Saturday', time_of_day: 'Morning' }
            ],
            skills_attributes: [
              { name: 'Photography' }
            ]
          }
        }
      end

      it 'creates a new Volunteer with nested attributes and returns 201 Created' do
        expect {
          post '/api/v1/public/volunteers', params: valid_attributes, as: :json
        }.to change(Volunteer, :count).by(1)
         .and change(Availability, :count).by(1)
         .and change(Skill, :count).by(1)

        expect(response).to have_http_status(:created)
        
        json_response = JSON.parse(response.body)
        expect(json_response['first_name']).to eq('John')
        expect(json_response['email']).to eq('john.doe@example.com')
      end
    end

    context 'with invalid parameters' do
      let(:invalid_attributes) do
        {
          volunteer: {
            first_name: '', # Invalid: missing first name
            last_name: 'Doe',
            email: 'invalid_email', # Invalid: wrong format
            phone: '555-1234'
          }
        }
      end

      it 'does not create a Volunteer and returns 422 Unprocessable Entity' do
        expect {
          post '/api/v1/public/volunteers', params: invalid_attributes, as: :json
        }.not_to change(Volunteer, :count)

        expect(response).to have_http_status(:unprocessable_entity)
        
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include("First name can't be blank")
        expect(json_response['errors']).to include("Email is invalid")
      end
    end
  end
end
