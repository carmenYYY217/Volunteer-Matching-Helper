module Api
  module V1
    module Admin
      class VolunteersController < BaseController
        def index
          volunteers = Volunteer.all

          if params[:skill_id].present?
            volunteers = volunteers.with_skill(params[:skill_id])
          end

          if params[:day_of_week].present?
            volunteers = volunteers.available_on(params[:day_of_week])
          end

          render json: volunteers.distinct.as_json(include: [:skills, :availabilities])
        end

        def update
          volunteer = Volunteer.find(params[:id])
          
          # Update attributes (this will also trigger the custom setters for skills and availabilities)
          volunteer.assign_attributes(volunteer_params)

          if volunteer.save
            render json: volunteer.as_json(include: [:skills, :availabilities])
          else
            render json: { errors: volunteer.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          volunteer = Volunteer.find(params[:id])
          volunteer.destroy
          head :no_content
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
