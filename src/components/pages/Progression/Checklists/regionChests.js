import React from 'react';
import cx from 'classnames';
import orderBy from 'lodash/orderBy';

const regionChests = (props) => {

  let characterProgressions = props.state.ProfileResponse.characterProgressions.data;
  let profileProgressions = props.state.ProfileResponse.profileProgression.data;
  let characterId = props.route.match.params.characterId;

  let manifest = props.manifest;

  let list = []

  Object.entries(characterProgressions[characterId].checklists[1697465175]).forEach(([key, value]) => {
    let hash = parseInt(key, 10);

    let completed = value;

    let item = false;
    Object.entries(manifest.DestinyChecklistDefinition[1697465175].entries).forEach(([pear, peach]) => {
      if (manifest.DestinyChecklistDefinition[1697465175].entries[pear].checklistHash === hash) {
        item = manifest.DestinyChecklistDefinition[1697465175].entries[pear];
        return;
      }
    });

    let destination = false;
    Object.keys(manifest.DestinyDestinationDefinition).forEach(subKey => {
      if (manifest.DestinyDestinationDefinition[subKey].hash === item.destinationHash) {
        destination = manifest.DestinyDestinationDefinition[subKey];
        return;
      }
    });

    let place = false;
    Object.keys(manifest.DestinyPlaceDefinition).forEach(subKey => {
      if (manifest.DestinyPlaceDefinition[subKey].hash === destination.placeHash) {
        place = manifest.DestinyPlaceDefinition[subKey];
        return;
      }
    });

    let regionchest = false;
    Object.keys(destination.bubbles).forEach(subKey => {
      if (destination.bubbles[subKey].hash === item.bubbleHash) {
        regionchest = destination.bubbles[subKey];
        return;
      }
    });
    
    list.push({
      completed: completed ? 1 : 0,
      place: place.displayProperties.name,
      name: regionchest ? regionchest.displayProperties.name : `???`,
      element: <li key={item.hash}>
        <div className={cx(
            "state",
            {
              "completed": completed
            }
          )}></div>
        <div className="text">
          <p>{ regionchest ? regionchest.displayProperties.name : `???` }</p>
          <p>{ place.displayProperties.name }</p>
        </div>
      </li>
      })
  });

  list = orderBy(list, [item => item.completed, item => item.place, item => item.name], ['asc', 'asc', 'asc']);

  return (
    <>
      <div className="head">
        <h4>Region chests</h4>
        <div className="binding">
          <p>Profile bound with the exception of DLC 1 and DLC 2 chests</p>
        </div>
        <div className="progress">
          <div className="title">Region chests opened</div>
          <div className="fraction">{Object.values(characterProgressions[characterId].checklists[1697465175]).filter(value => value === true).length}/{Object.keys(characterProgressions[characterId].checklists[1697465175]).length}</div>
          <div className="bar" style={{
            width: `${ Object.values(characterProgressions[characterId].checklists[1697465175]).filter(value => value === true).length / Object.keys(characterProgressions[characterId].checklists[1697465175]).length * 100 }%`
          }}></div>
        </div>
      </div>
      <ul className="list no-interaction">
        {list.map(obj => obj.element)}
      </ul>
    </>
  )

}

export default regionChests;