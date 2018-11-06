import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import cx from 'classnames';

import { classTypeToString } from '../../destinyUtils'
import Globals from '../../Globals';

import './Characters.css';
import './Player.css';
import ObservedImage from '../../ObservedImage';




class Player extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expandCharacters: false,
      emblemsResponse: false,
      activeCharacterId: this.props.route.match.params.characterId
    }

    this.expandCharacters = this.expandCharacters.bind(this);
    this.emblemBackgrounds = null;
  }

  expandCharacters = (e) => {
    if (this.state.expandCharacters) {
      this.setState({
        expandCharacters: false
      });
    }
    else {
      e.preventDefault();
      this.setState({
        expandCharacters: true
      });
    }
  }

  getEmblems = (hashes) => {
    fetch(
      `https://api.braytech.org/?request=manifest&table=DestinyInventoryItemDefinition&hash=${ hashes.map(obj => { return obj.hash }).join(",") }`,
      {
        headers: {
          "X-API-Key": Globals.key.braytech,
        }
      }
    )
    .then(response => {
      return response.json();
    })
      .then(response => {

        this.setState({
          emblemsResponse: response.response.data.items
        });

      })
    .catch(error => {
      console.log(error);
    })
  }

  componentDidUpdate(prevProps, prevState) {

    if (prevProps.route.match.params.characterId !== this.props.route.match.params.characterId) {
      this.setState({
        activeCharacterId: this.props.route.match.params.characterId
      });
    }    

  }

  render() {

    let props = this.props;

    let profile = props.data.ProfileResponse.profile.data;
    let characters = props.data.ProfileResponse.characters.data;
    let characterProgressions = props.data.ProfileResponse.characterProgressions.data;
    let profileProgressions = props.data.ProfileResponse.profileProgression.data;
    let profileRecords = props.data.ProfileResponse.profileRecords.data;

    let activeCharacter;
    let charactersRender = [];
    let emblemHashes = [];

    characters.forEach(character => {

      if (character.characterId === this.state.activeCharacterId) {
        activeCharacter = character
      }

      let capped = characterProgressions[character.characterId].progressions[1716568313].level === characterProgressions[character.characterId].progressions[1716568313].levelCap 
      ? true : false;

      emblemHashes.push({
        character: character.characterId,
        hash: character.emblemHash
      })

      let progress = capped ? 
      characterProgressions[character.characterId].progressions[2030054750].progressToNextLevel / characterProgressions[character.characterId].progressions[2030054750].nextLevelAt 
      : characterProgressions[character.characterId].progressions[1716568313].progressToNextLevel / characterProgressions[character.characterId].progressions[1716568313].nextLevelAt;

      charactersRender.push(
        <li key={character.characterId} 
          data-id={character.characterId}
          className={cx(
            {
              "active": character.characterId === this.state.activeCharacterId ? true : false
            }
          )}>
          <ObservedImage className={cx(
                "image",
                "emblem",
                {
                  "missing": !character.emblemBackgroundPath
                }
              )}
            src={ `https://www.bungie.net${ character.emblemBackgroundPath ? character.emblemBackgroundPath : `/img/misc/missing_icon_d2.png` }` } />
          <div className="displayName">{ profile.userInfo.displayName }</div>
          <div className="class">{ classTypeToString(character.classType) }</div>
          <div className="light">{ character.light }</div>
          <div className="level">Level { character.baseCharacterLevel }</div>
          <div className="progress">
            <div className={cx(
                "bar",
                {
                  "capped": capped
                }
              )}
              style={
                {
                  width: `${ progress * 100 }%`
                }
              } ></div>
          </div>
          <Link onClick={this.expandCharacters} to={`/progression/${props.route.match.params.membershipType}/${props.route.match.params.membershipId}/${character.characterId}${props.route.match.params.view ? `/${props.route.match.params.view}`:``}`}></Link>
        </li>
      )
    });

    charactersRender.push(
      <li key="profileChange" className="change"
        onClick={this.props.goToProgression}>
        <div className="text">
          <h4>Change profile</h4>
        </div>
      </li>
    )

    if (!this.state.emblemsResponse) {
      this.getEmblems(emblemHashes);
    }

    const views = [
      {
        name: "Summary",
        slug: ""
      },
      {
        name: "Checklists",
        slug: "/checklists"
      },
      {
        name: "Ranks",
        slug: "/ranks",
        dev: true
      },
      {
        name: "Triumphs",
        slug: "/triumphs",
        dev: true
      },
      {
        name: "Exotics",
        slug: "/exotics",
        dev: true
      }
    ]

    if (this.state.emblemsResponse) {
      let emblems = [];
      emblemHashes.forEach(obj => {

        let characterId = obj.character;
        let emblemResponse = null;
        Object.keys(this.state.emblemsResponse).forEach(key => {
          if (this.state.emblemsResponse[key].hash === obj.hash) {
            emblemResponse = this.state.emblemsResponse[key];
            return;
          }
        });

        emblems.push(
          <ObservedImage key={characterId} data-id={characterId} className={cx(
                "image",
                "emblem",
                {
                  "missing": emblemResponse.redacted,
                  "active": this.state.activeCharacterId === characterId ? true : false
                }
              )}
            src={ `https://www.bungie.net${ emblemResponse.secondarySpecial ? emblemResponse.secondarySpecial : `/img/misc/missing_icon_d2.png` }` } />
        )
      });
      this.emblemBackgrounds = emblems;
    }

    return (
      <div id="player">
        <div className="backgrounds">{this.emblemBackgrounds}</div>
        <div className={cx(
            "characters",
            {
              "expanded": this.state.expandCharacters
            }
          )} ref={(characters)=>{this.charactersUI = characters}}>
          <ul className="list">{charactersRender}</ul>
        </div>
        <div className="stats">
          <div>
            <h4>Score</h4>
            <div>{profileRecords.score}</div>
          </div>
          <div>
            <h4>Playtime</h4>
            <div>{Math.floor(Object.keys(characters).reduce((sum, key) => { return sum + parseInt(characters[key].minutesPlayedTotal); }, 0 ) / 1440)} days</div>
          </div>
        </div>
        <div className="views">
          <h4>Views</h4>
          <ul>
            { views.map(view => {
              let route = this.props.route;
              let to = `/progression/${route.match.params.membershipType}/${route.match.params.membershipId}/${route.match.params.characterId}${view.slug}`;
              return (
                <li key={view.slug}>{view.dev ? `${view.name}` : <NavLink to={to} exact>{view.name}</NavLink>}</li>
              )
            }) }
          </ul>
        </div>
      </div>
    )

  }
}

export default Player;