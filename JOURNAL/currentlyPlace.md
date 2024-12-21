[[December 17th, 2024]]
  - frontend should handle logic for figuring out whether entire update is entirely new data or not. If so, just createNewCurrently - dont need to hit update API. update API only used when there is new AND OLD data still
  - EDIT_PLACE_TEXT: { updateType: 'editPlaceText', newValue: 'somewhere' },
  - EDIT_PLACE_DURATION:
  - NEW_PLACE: 
  - DELETE_PLACE: 
  - NEW_TAG: { updateType: 'newTag', newValue: { tag: 'hi', duration: 'whatevs' } },
  - EDIT_TAG_TEXT: 
  - EDIT_TAG_DURATION: { updateType: 'editTagDuration', target: 'tagName', newValue: 'someMs' }
  - DELETE_TAG: 
  - EDIT_STATUS_TEXT:
  - EDIT_STATUS_DURATION: 
  - NEW_STATUS:
  - DELETE_STATUS:
  - CLEAR_ALL: i guess just change updatedDurationAt for everything so it's finished (i guess frontend should know when one of the other methods is last step and should just call CLEAR_ALL instead?)
  
