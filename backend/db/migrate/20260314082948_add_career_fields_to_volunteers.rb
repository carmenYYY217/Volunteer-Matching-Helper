class AddCareerFieldsToVolunteers < ActiveRecord::Migration[7.2]
  def change
    add_column :volunteers, :target_role, :string
    add_column :volunteers, :location, :string
    add_column :volunteers, :cv_url, :string
  end
end
