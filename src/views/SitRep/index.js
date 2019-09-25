import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { orderBy, flattenDepth } from 'lodash';
import cx from 'classnames';

import manifest from '../../utils/manifest';
import * as utils from '../../utils/destinyUtils';
import * as bungie from '../../utils/bungie';
import ObservedImage from '../../components/ObservedImage';
import Spinner from '../../components/UI/Spinner';
import Ranks from '../../components/Ranks';
import Roster from '../../components/Roster';

import { ReactComponent as CrucibleIconMayhem } from './icons/mayhem.svg';
import { ReactComponent as CrucibleIconDoubles } from './icons/doubles.svg';
import { ReactComponent as CrucibleIconBreakthrough } from './icons/breakthrough.svg';
import { ReactComponent as CrucibleIconIronBanner } from './icons/iron-banner.svg';

import './styles.css';

class SitRep extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      bNetNews: {
        loading: true,
        error: false,
        items: []
      }
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.props.rebindTooltips();

    this.bNetNews();
  }

  bNetNews = async () => {
    try {
      const response = await bungie.GetTrendingCategories();

      const news = response.categories && response.categories.find(c => c.categoryId === 'News');

      console.log(news.entries.results);

      if (news) {
        this.setState({
          bNetNews: {
            loading: false,
            error: false,
            items: news.entries.results
          }
        });
      } else {
        this.setState({
          bNetNews: {
            loading: false,
            error: true,
            items: []
          }
        });
      }
    } catch (e) {
      this.setState({
        bNetNews: {
          loading: false,
          error: true,
          items: []
        }
      });
    }
  }

  render() {
    const { t, member, groupMembers } = this.props;
    const { profile, milestones } = member.data;
    const group = member.data.groups.results.length > 0 ? member.data.groups.results[0].group : false;
    const characters = member.data.profile.characters.data;
    const character = characters.find(c => c.characterId === member.characterId);
    const characterProgressions = member.data.profile.characterProgressions.data;
    const characterActivities = member.data.profile.characterActivities.data;

    const wellRestedState = utils.isWellRested(characterProgressions[character.characterId]);

    // console.log(wellRestedState)

    characterActivities[member.characterId].availableActivities.forEach(a => {
      // console.log(manifest.DestinyActivityDefinition[a.activityHash])
    });

    // flashpoint
    const milestoneFlashpointQuestItem = milestones[463010297].availableQuests && milestones[463010297].availableQuests.length && manifest.DestinyMilestoneDefinition[463010297].quests[milestones[463010297].availableQuests[0].questItemHash];
    const definitionFlashpointVendor =
    milestoneFlashpointQuestItem &&
      Object.values(manifest.DestinyVendorDefinition).find(v => {
        if (milestoneFlashpointQuestItem.destinationHash === 1993421442) {
          return v.locations && v.locations.find(l => l.destinationHash === 3669933163);
        } else {
          return v.locations && v.locations.find(l => l.destinationHash === milestoneFlashpointQuestItem.destinationHash);
        }
      });
      const definitionFlashpointFaction = definitionFlashpointVendor && manifest.DestinyFactionDefinition[definitionFlashpointVendor.factionHash];
    
    // console.log(definitionMilestoneFLashpoint, milestoneFlashpointQuestItem, definitionFlashpointVendor)

    const commonCrucibleModes = [
      3243161126, // Quickplay
      3062197616, // Competitive
      1859507212, // Private Match
      2274172949, // Quickplay
      2947109551, // Competitive
      2087163649  // Rumble
    ];
    const crucibleModeIcons = {
      1312786953: <CrucibleIconMayhem />
    };
    const featuredCrucibleMode = characterActivities[member.characterId].availableActivities.find(a => {
      if (!a.activityHash) return false;
      const definitionActivity = manifest.DestinyActivityDefinition[a.activityHash];

      if (definitionActivity && definitionActivity.activityModeTypes.includes(5) && !commonCrucibleModes.includes(definitionActivity.hash)) {
        a.displayProperties = definitionActivity.displayProperties;
        a.icon = crucibleModeIcons[definitionActivity.hash];
        return true;
      }

      return false;
    });

    console.log(featuredCrucibleMode);
    
    const knownStoryActivities = [129918239, 271962655, 589157009, 1023966646, 1070049743, 1132291813, 1259766043, 1313648352, 1513386090, 1534123682, 1602328239, 1872813880, 1882259272, 1906514856, 2000185095, 2146977720, 2568845238, 2660895412, 2772894447, 2776154899, 3008658049, 3205547455, 3271773240, 4009655461, 4234327344, 4237009519, 4244464899];
    const dailyHeroicStoryActivities = characterActivities[member.characterId].availableActivities.filter(a => {
      if (!a.activityHash) return false;

      if (!knownStoryActivities.includes(a.activityHash)) return false;

      return true;
    });
    const dailyHeroicStories = {
      activities: dailyHeroicStoryActivities,
      displayProperties: {
        name: manifest.DestinyPresentationNodeDefinition[3028486709] && manifest.DestinyPresentationNodeDefinition[3028486709].displayProperties && manifest.DestinyPresentationNodeDefinition[3028486709].displayProperties.name
      }
    }

    // orderBy(Object.values(manifest.DestinyActivityDefinition).map(a => {
    //   if (a.activityModeTypes && a.activityModeTypes.length && a.activityModeTypes.includes(46) && !a.guidedGame && a.modifiers.length > 2) return a;
    //   return false
    // }).filter(a => a),
    // [m => m.displayProperties.name],
    // ['asc']).forEach(a => {
    //   console.log(a.displayProperties.name, a.hash, JSON.stringify(a.activityModeTypes))
    // })

    const weeklyNightfallStrikeActivities = characterActivities[member.characterId].availableActivities.filter(a => {
      if (!a.activityHash) return false;

      const definitionActivity = manifest.DestinyActivityDefinition[a.activityHash];

      if (definitionActivity && definitionActivity.activityModeTypes.includes(46) && !a.guidedGame && a.modifiers && a.modifiers.length > 2) return true;

      return false;
    });
    const weeklyNightfallStrikes = {
      activities: weeklyNightfallStrikeActivities,
      displayProperties: {
        name: t('Nightfalls')
      }
    }

    // console.log(weeklyNightfallStrikeActivities.map(a => manifest.DestinyActivityDefinition[a.activityHash]))

    

    return (
      <div className='view' id='sit-rep'>
        <div className='module head'>
          <div className='content'>
            <div className='page-header'>
              <div className='sub-name'>{t('Now')}</div>
              <div className='name'>{manifest.DestinyDestinationDefinition[milestoneFlashpointQuestItem.destinationHash].displayProperties.name}</div>
            </div>
            {definitionFlashpointVendor && definitionFlashpointVendor.displayProperties ? (
              <div className='text'>
                <p>{t('{{vendorName}} is waiting for you at {{destinationName}}.', { vendorName: definitionFlashpointVendor.displayProperties && definitionFlashpointVendor.displayProperties.name, destinationName: manifest.DestinyDestinationDefinition[milestoneFlashpointQuestItem.destinationHash].displayProperties.name })}</p>
                <p>
                  <em>{definitionFlashpointFaction.displayProperties.description}</em>
                </p>
              </div>
            ) : (
              <div className='text'>
                <p>{t('Beep-boop?')}</p>
              </div>
            )}
          </div>
          <div className='content highlight crucible'>
            <div className='module-header'>
              <div className='sub-name'>{t('Crucible')}</div>
            </div>
            <div className='mode'>
              <div className='icon'>{featuredCrucibleMode.icon}</div>
              <div className='text'>
                <p>{featuredCrucibleMode.displayProperties.name}</p>
                <p>{featuredCrucibleMode.displayProperties.description}</p>
              </div>
            </div>
          </div>
          <div className='content highlight'>
            <div className='module-header'>
              <div className='sub-name'>{dailyHeroicStories.displayProperties.name}</div>
            </div>
            <ul className='list activities'>
              {orderBy(
                dailyHeroicStories.activities.map((a, i) => {
                  const definitionActivity = manifest.DestinyActivityDefinition[a.activityHash];

                  return {
                    light: definitionActivity.activityLightLevel,
                    el: (
                      <li key={i} className='linked tooltip' data-table='DestinyActivityDefinition' data-hash={a.activityHash} data-mode='175275639'>
                        <div className='name'>{definitionActivity.selectionScreenDisplayProperties && definitionActivity.selectionScreenDisplayProperties.name ? definitionActivity.selectionScreenDisplayProperties.name : definitionActivity.displayProperties && definitionActivity.displayProperties.name ? definitionActivity.displayProperties.name : t('Unknown')}</div>
                        <div>
                          <div className='time'>
                            {definitionActivity.timeToComplete ? (
                              <>
                                {t('{{number}} mins', { number: definitionActivity.timeToComplete || 0 })}
                              </>
                            ) : null}
                          </div>
                          <div className='light'>
                            <span>{definitionActivity.activityLightLevel}</span>
                          </div>
                        </div>
                      </li>
                    )
                  };
                }),
                [m => m.light],
                ['asc']
              ).map(e => e.el)}
            </ul>
          </div>
          <div className='content highlight'>
            <div className='module-header'>
              <div className='sub-name'>{weeklyNightfallStrikes.displayProperties.name}</div>
            </div>
            <ul className='list activities'>
              {orderBy(
                weeklyNightfallStrikes.activities.map((a, i) => {
                  const definitionActivity = manifest.DestinyActivityDefinition[a.activityHash];

                  return {
                    light: definitionActivity.activityLightLevel,
                    el: (
                      <li key={i} className='linked tooltip' data-table='DestinyActivityDefinition' data-hash={a.activityHash} data-mode='175275639'>
                        <div className='name'>{definitionActivity.selectionScreenDisplayProperties && definitionActivity.selectionScreenDisplayProperties.name ? definitionActivity.selectionScreenDisplayProperties.name : definitionActivity.displayProperties && definitionActivity.displayProperties.name ? definitionActivity.displayProperties.name : t('Unknown')}</div>
                        <div>
                          <div className='time'>
                            {definitionActivity.timeToComplete ? (
                              <>
                                {t('{{number}} mins', { number: definitionActivity.timeToComplete || 0 })}
                              </>
                            ) : null}
                          </div>
                          <div className='light'>
                            <span>{definitionActivity.activityLightLevel}</span>
                          </div>
                        </div>
                      </li>
                    )
                  };
                }),
                [m => m.light],
                ['asc']
              ).map(e => e.el)}
            </ul>
          </div>
        </div>
        <div className='padder'>
          <div className='module'>
            <div className='sub-header'>
              <div>{t('Ranks')}</div>
            </div>
            <div className='ranks'>
              {[2772425241, 2626549951, 2000925172].map(hash => {
                return <Ranks key={hash} hash={hash} data={{ membershipType: member.membershipType, membershipId: member.membershipId, characterId: member.characterId, characters: member.data.profile.characters.data, characterProgressions }} />;
              })}
            </div>
          </div>
          {group ? (
            <div className='module clan-roster'>
              <div className='sub-header'>
                <div>{t('Clan roster')}</div>
                <div>{groupMembers.members.filter(member => member.isOnline).length} online</div>
              </div>
              <div className='refresh'>{groupMembers.loading && groupMembers.members.length !== 0 ? <Spinner mini /> : null}</div>
              {groupMembers.loading && groupMembers.members.length === 0 ? <Spinner /> : <Roster mini showOnline />}
            </div>
          ) : null}
          <div className='module'>
            <div className='sub-header'>
              <div>Bungie.net</div>
            </div>
            {this.state.bNetNews.loading ? <Spinner /> : !this.state.bNetNews.loading && !this.state.bNetNews.error ? (
              <div className='news'>
                <ObservedImage className='image padding' ratio='0.5' src={`https://www.bungie.net${this.state.bNetNews.items[0].image}`} />
                <p>Some text</p><p>Some text</p>
                
              </div>
            ) : (
              <p>There was an error</p>
            )}
          </div>
          <div className='module'>
            <div className='sub-header'>
              <div>Braytech</div>
            </div>
            <div className=''></div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    groupMembers: state.groupMembers,
    collectibles: state.collectibles
  };
}

function mapDispatchToProps(dispatch) {
  return {
    rebindTooltips: value => {
      dispatch({ type: 'REBIND_TOOLTIPS', payload: new Date().getTime() });
    }
  };
}

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  withTranslation()
)(SitRep);
