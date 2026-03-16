export interface LandmarkInfo {
  index: number  // position in landmarks array, used to look up from map click
  common_name: string
  scientific_name: string
  address: string
  latitude: number
  longitude: number
  detail: string
  description: string
  image_url: string
  closeup_url: string
  curator: string
  tree_id: number   // positive = real city tree ID, negative = synthetic (private/park tree)
  match_type: string
  match_distance_m: number | null
}
