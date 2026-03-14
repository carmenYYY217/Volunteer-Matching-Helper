module Api
  module V1
    module Admin
      class SessionsController < ApplicationController
        def create
          admin = ::Admin.find_by(email: params[:email])

          if admin&.authenticate(params[:password])
            token = JsonWebToken.encode(admin_id: admin.id)
            render json: { token: token }, status: :ok
          else
            render json: { error: 'Invalid email or password' }, status: :unauthorized
          end
        end
      end
    end
  end
end
