module Api
  module V1
    module Public
      class VolunteersController < ApplicationController
        def create
          # Find existing volunteer by email (if provided) or initialize a new one
          if volunteer_params[:email].present?
            volunteer = Volunteer.find_or_initialize_by(email: volunteer_params[:email])
          elsif volunteer_params[:phone].present?
            volunteer = Volunteer.find_or_initialize_by(phone: volunteer_params[:phone])
          else
            volunteer = Volunteer.new
          end
          
          # Update attributes (this will also trigger the custom setters for skills and availabilities)
          volunteer.assign_attributes(volunteer_params)

          if volunteer.save
            render json: volunteer, status: :created
          else
            render json: { errors: volunteer.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def volunteer_params
          params.require(:volunteer).permit(
            :first_name, :last_name, :email, :phone,
            :target_role, :location, :cv_url,
            availabilities_attributes: [:day_of_week, :time_of_day],
            skills_attributes: [:name]
          )
        end
      end
    end
  end
end
