require 'rails_helper'

RSpec.describe 'Api::V1::Admin::Roles', type: :request do
  let(:admin) { create(:admin) }
  let(:token) { JsonWebToken.encode(admin_id: admin.id) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'GET /api/v1/admin/roles' do
    before do
      create_list(:role, 3, :with_skills)
    end

    it 'returns a successful response and the correct JSON array of roles' do
      get '/api/v1/admin/roles', headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      
      json_response = JSON.parse(response.body)
      expect(json_response).to be_an(Array)
      expect(json_response.length).to eq(3)
      
      # Ensure skills are included in the JSON payload
      first_role = json_response.first
      expect(first_role).to have_key('skills')
      expect(first_role['skills']).to be_an(Array)
    end

    it 'returns 401 Unauthorized if token is missing' do
      get '/api/v1/admin/roles', as: :json

      expect(response).to have_http_status(:unauthorized)
      
      json_response = JSON.parse(response.body)
      expect(json_response['error']).to eq('Unauthorized')
    end
  end
end
