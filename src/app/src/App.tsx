import * as React from "react";
import * as _ from "lodash";
const BEMBlock = require("bem-cn")

import {
  SearchBox,
  Hits,
  HitsStats,
  RefinementListFilter,
  Pagination,
  ResetFilters,
  MenuFilter,
  SelectedFilters,
  Toggle,
  HierarchicalMenuFilter,
  NumericRefinementListFilter,
  PageSizeSelector,
  SortingSelector,
  SearchkitComponent,
  SearchkitProvider,
  SearchkitManager,
  NoHits,
  RangeFilter,
  InitialLoader,
  ViewSwitcherToggle,
  ViewSwitcherHits,
  Layout, LayoutBody, LayoutResults,
  SideBar, TopBar,
  ActionBar, ActionBarRow
} from "searchkit";

import "searchkit/theming/theme.scss";
import "./../styles/customisations.scss";

import {MovieHitsGridItem, MovieHitsListItem} from "./ResultComponents"


let thisSearchkit ;


const NoHitsDisplay = (props) => {
  const {bemBlocks, query, suggestion, noResultsLabel, resetFilters} = props
  let divsToAdd = [];
  if(!suggestion){
    divsToAdd.push(React.createElement("div", {className: bemBlocks.container("info"), key: 9 },
                      "Ничего не найдено для",
                      React.createElement("span", {className: bemBlocks.container("em"), key: 1}, " "+query+".")),
                      React.createElement("div", {className: bemBlocks.container("steps"), key: 8},
                                      React.createElement("div", {className: bemBlocks.container("step-action"),
                                                          onClick: ()=>{thisSearchkit.getQueryAccessor().resetState(); thisSearchkit.performSearch(true);} },
                                                          "Сбросить поиск" )))
  }
  else{
    divsToAdd.push(React.createElement("div", {className: bemBlocks.container("info"), key: 10 },
                      "Ничего не найдено для",
                      React.createElement("span", {className: bemBlocks.container("em"), key: 1}, " "+query+"."),
                      React.createElement("span", {className: bemBlocks.container(), key: 2}, " Искать:")))

    for(let i=0; i<thisSearchkit.results.suggest.suggestions[0].options.length; i++){
      divsToAdd.push(React.createElement("div", {className: bemBlocks.container("steps"), key: i},
                      React.createElement("div", {className: bemBlocks.container("step-action"),
                                          onClick: (e)=>{e.preventDefault();  thisSearchkit.getQueryAccessor().setQueryString(thisSearchkit.results.suggest.suggestions[0].options[i].text, true); thisSearchkit.performSearch(true);} },
                                          thisSearchkit.results.suggest.suggestions[0].options[i].text )))
    }
  }
  return (
    <div data-qa="no-hits" className={bemBlocks.container()}>
        {divsToAdd}
    </div>
  );
}

export class App extends React.Component<any, any> {

  searchkit:SearchkitManager

  constructor() {
    super()
    const host = "/api/movies"
    this.searchkit = new SearchkitManager(host)
    thisSearchkit = this.searchkit

    this.searchkit.setQueryProcessor((plainQueryObject)=>{
      let text = this.searchkit.query.getQueryString();
      let suggestions = {"phrase":{"field":"title","real_word_error_likelihood":0.95,"max_errors":1,"gram_size":4,"direct_generator":[{"field":"_all","suggest_mode":"always","min_word_length":1}]}};
      plainQueryObject.suggest = {suggestions};
      plainQueryObject.suggest.text = text;
      return plainQueryObject
    })

    this.searchkit.translateFunction = (key)=> {
      return {
        "pagination.next":"Следующая",
        "pagination.previous":"Предыдущая",
        "searchbox.placeholder":"Поиск...",
        "hitstats.results_found":"{hitCount} найдено",
        "facets.view_more":"Показать больше",
        "facets.view_all":"Показать все",
        "facets.view_less":"Показать меньше",
        "reset.clear_all":"Сбросить фильтры",
        "NoHits.DidYouMean":"Искать {suggestion}",
        "NoHits.NoResultsFound":"Ничего не найдено для {query}.",
        "NoHits.NoResultsFoundDidYouMean":"Ничего не найдено для {query}. Может быть {suggestion}?",
        "NoHits.SearchWithoutFilters":"Искать {query} без фильтров"
      }[key]
    }
  }


  render(){

    return (
      <SearchkitProvider searchkit={this.searchkit}>
        <Layout>
          <TopBar>
            <div className="my-logo">МИР24 фотобанк</div>
            <SearchBox
              translations={{"searchbox.placeholder":"type at least 3 characters for image search"}}
              queryOptions={{"minimum_should_match":"70%"}}
              autofocus={true}
              searchOnChange={true}
              queryFields={["keywords^12", "title^11", "description^10", "plot"]}/>
          </TopBar>

          <LayoutBody>

      			<SideBar>
      				<HierarchicalMenuFilter fields={["type.raw", "genres.raw"]} title="Categories" id="categories"/>
              <RangeFilter min={0} max={100} field="metaScore" id="metascore" title="Metascore" showHistogram={true}/>
              <RangeFilter min={500} max={6000} field="exifimagelength" id="exifimagelength" title="Высота изображения" showHistogram={true}/>
              <RangeFilter min={500} max={6000} field="exifimagewidth" id="exifimagewidth" title="Ширина изображения" showHistogram={true}/>
              <NumericRefinementListFilter id="smallBig" title="Размер" field="sizetype" options={[
                {title:"Все"},
                {title:"Маленькие, до 1500px", from:0, to:1500},
                {title:"Большие, свыше 1500px", from:1500, to:9000}
              ]}/>
              <NumericRefinementListFilter id="alignment" title="Отношение сторон" field="horizontal" options={[
                {title:"Все"},
                {title:"Вертикальные", from:0, to:1},
                {title:"Горизонтальные", from:1, to:2}
              ]}/>
              <RefinementListFilter operator="OR" id="author" title="Автор" field="author.raw" size={10}/>
            </SideBar>

      			<LayoutResults>

              <ActionBar>

                <ActionBarRow>
          				<HitsStats translations={{
                    "hitstats.results_found":"{hitCount} results found"
                  }}/>
                  <SortingSelector  options={[
                    {label:"Без сортировки", defaultOption:true},
                    {label:"Сначала - новые", field:"date_taken", order:"desc"}
                  ]}/>
		  <PageSizeSelector options={[25,50,100]} listComponent={Toggle}/>
			  <ViewSwitcherToggle/>
                </ActionBarRow>
                <ActionBarRow>
                  <SelectedFilters/>
                  <ResetFilters/>
                </ActionBarRow>

              </ActionBar>

              <ViewSwitcherHits
                  hitsPerPage={50} highlightFields={["title", "keywords", "description"]}

                  sourceFilter={["plot", "title", "keywords", "description", "poster", "imdbId", "exifimagelength", "exifimagewidth", "date_taken"]}

                  hitComponents = {[
                    {key:"grid", title:"Плитка", itemComponent:MovieHitsGridItem, defaultOption:true},
                    {key:"list", title:"Список", itemComponent:MovieHitsListItem}
                  ]}
                  scrollTo="body"
              />

              <NoHits component={NoHitsDisplay} suggestionsField={"title"}/>
              <InitialLoader/>
      				<Pagination showNumbers={true}/>
      			</LayoutResults>
          </LayoutBody>
    			<a className="view-src-link" href="https://github.com/searchkit/searchkit-demo/blob/master/src/app/src/App.tsx">View source »</a>
    		</Layout>
      </SearchkitProvider>
	)}

}
