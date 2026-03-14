module Api
  module V1
    module Admin
      class BaseController < ApplicationController
        # before_action :authenticate_request!

        private

        def authenticate_request!
          header = request.headers['Authorization']
          header = header.split(' ').last if header
          begin
            @decoded = JsonWebToken.decode(header)
            @current_admin = ::Admin.find(@decoded[:admin_id])
          rescue ActiveRecord::RecordNotFound, JWT::DecodeError
            render json: { error: 'Unauthorized' }, status: :unauthorized
          end
        end
      end
    end
  end
end
